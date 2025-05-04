import type { NextApiRequest, NextApiResponse } from 'next';
import { Candidate, WhatsAppResponse } from '@/types/candidate';
import { processInBatches } from '@/utils/batchHelper';

// Define a list of allowed phone numbers (add your authorized numbers here)
const ALLOWED_PHONE_NUMBERS = new Set([
  '+919608516015', // Add all candidate phone numbers from Firestore here
  // Example: '+912345678901',
]);

// Delay between batches to avoid rate limits (in milliseconds)
const BATCH_DELAY_MS = 5000;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const candidates: Candidate[] = req.body.candidates || [];
  console.log("Backend received candidates:", candidates);

  if (!candidates.length) {
    return res.status(400).json({ message: 'No candidates provided' });
  }

  console.log("WHATSAPP_PHONE_ID:", process.env.WHATSAPP_PHONE_ID ? "Set" : "Not set");
  console.log("WHATSAPP_TOKEN:", process.env.WHATSAPP_TOKEN ? "Set" : "Not set");

  if (!process.env.WHATSAPP_PHONE_ID || !process.env.WHATSAPP_TOKEN) {
    return res.status(500).json({ message: 'WhatsApp API credentials are missing' });
  }

  // Process candidates in batches to avoid rate limits
  const results = await processInBatches<Candidate, WhatsAppResponse>(
    candidates,
    10, // Batch size
    async (batch) => {
      const batchResults: WhatsAppResponse[] = [];
      console.log(`Processing batch of ${batch.length} candidates`);

      for (const candidate of batch) {
        try {
          // Normalize phone number: remove non-digits, ensure + prefix
          const cleanPhone = candidate.phone.replace(/\D/g, "");
          if (!cleanPhone || cleanPhone.length < 10) {
            console.warn(`Invalid phone number for ${candidate.name}: ${candidate.phone}`);
            batchResults.push({
              phone: candidate.phone,
              status: 'error',
              error: 'Invalid phone number format. Must be at least 10 digits.',
            });
            continue;
          }

          const phone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
          console.log(`Validating phone number: ${phone} for ${candidate.name}`);

          // Validate phone number against allowed list
          if (!ALLOWED_PHONE_NUMBERS.has(phone)) {
            console.warn(`Phone number ${phone} is not in the allowed list for ${candidate.name}`);
            batchResults.push({
              phone: candidate.phone,
              status: 'error',
              error: 'Recipient phone number not in allowed list. Add to the ALLOWED_PHONE_NUMBERS list in sendwhatsapp.ts.',
            });
            continue;
          }

          console.log(`Sending message to ${phone} for ${candidate.name}`);
          
          const response = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'template',
                template: {
                  name: 'hello_world',
                  language: { code: 'en_US' },
                },
              }),
            }
          );

          const data = await response.json();
          console.log(`WhatsApp API response for ${phone}:`, data);

          if (response.ok && data.messages?.[0]?.id) {
            batchResults.push({
              phone: candidate.phone,
              status: 'success',
              messageId: data.messages[0].id,
            });
          } else {
            console.error(`Failed to send message to ${candidate.phone}:`, data);
            batchResults.push({
              phone: candidate.phone,
              status: 'error',
              error: data.error?.message || 'Unknown error from WhatsApp API',
            });
          }
        } catch (error) {
          console.error(`Error sending message to ${candidate.phone}:`, error);
          batchResults.push({
            phone: candidate.phone,
            status: 'error',
            error: error instanceof Error ? error.message : 'Network error',
          });
        }
      }

      console.log(`Batch results:`, batchResults);
      await delay(BATCH_DELAY_MS); // Delay between batches
      return batchResults;
    }
  );

  const allSuccessful = results.every((result) => result.status === 'success');
  console.log("Final results:", results);
  return res.status(allSuccessful ? 200 : 500).json({
    success: allSuccessful,
    results,
  });
}