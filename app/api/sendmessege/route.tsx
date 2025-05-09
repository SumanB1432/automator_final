import { NextRequest, NextResponse } from 'next/server';
import { Candidate, WhatsAppResponse } from '@/types/candidate';
import { processInBatches } from '@/utils/batchHelper';
import { getDatabase, ref, get } from 'firebase/database';
import app from '@/firebase/config';

export const runtime = 'nodejs'; // ✅ Use Node.js runtime to avoid Edge fetch issues

const BATCH_DELAY_MS = 5000;
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ✅ Fetch allowed phone numbers from Firebase
const fetchAllowedPhoneNumbers = async (): Promise<Set<string>> => {
  const db = getDatabase(app);
  const snapshot = await get(ref(db, 'candidates'));
  const allowed = new Set<string>();

  if (!snapshot.exists()) return allowed;

  const data = snapshot.val();
  for (const id in data) {
    const phoneRaw = data[id].phone;
    if (typeof phoneRaw !== 'string') continue;

    const digitsOnly = phoneRaw.replace(/\D/g, '');
    let normalized = '';
    if (digitsOnly.length === 10) {
      normalized = `+91${digitsOnly}`;
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      normalized = `+${digitsOnly}`;
    }
    if (normalized) {
      allowed.add(normalized);
    }
  }

  return allowed;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidates: Candidate[] = body.candidates || [];

    console.log('Received candidates:', candidates);

    if (!candidates.length) {
      return NextResponse.json({ message: 'No candidates provided' }, { status: 400 });
    }

    // ✅ Use server-only env vars (not NEXT_PUBLIC)
    const phoneId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID;
    const token = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;

    if (!phoneId || !token) {
      console.error('Missing WhatsApp API credentials');
      return NextResponse.json({ message: 'WhatsApp API credentials are missing' }, { status: 500 });
    }

    const ALLOWED_PHONE_NUMBERS = await fetchAllowedPhoneNumbers();
    console.log('Allowed phone numbers:', ALLOWED_PHONE_NUMBERS);

    const results = await processInBatches<Candidate, WhatsAppResponse>(
      candidates,
      10,
      async (batch) => {
        const batchResults: WhatsAppResponse[] = [];

        for (const candidate of batch) {
          try {
            const digitsOnly = candidate.phone.replace(/\D/g, '');
            let phone = '';
            if (digitsOnly.length === 10) {
              phone = `+91${digitsOnly}`;
            } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
              phone = `+${digitsOnly}`;
            } else {
              batchResults.push({
                phone: candidate.phone,
                status: 'error',
                error: 'Invalid phone number format.',
              });
              continue;
            }

            if (!ALLOWED_PHONE_NUMBERS.has(phone)) {
              batchResults.push({
                phone: candidate.phone,
                status: 'error',
                error: 'Phone number not in allowed list.',
              });
              continue;
            }

            const response = await fetch(
              `https://graph.facebook.com/v19.0/${phoneId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
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
            if (response.ok && data.messages?.[0]?.id) {
              batchResults.push({
                phone: candidate.phone,
                status: 'success',
                messageId: data.messages[0].id,
              });
            } else {
              batchResults.push({
                phone: candidate.phone,
                status: 'error',
                error: data.error?.message || 'Unknown error from WhatsApp API',
              });
            }
          } catch (error) {
            batchResults.push({
              phone: candidate.phone,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unexpected error',
            });
          }
        }

        await delay(BATCH_DELAY_MS);
        return batchResults;
      }
    );

    const allSuccessful = results.every((r) => r.status === 'success');

    return NextResponse.json(
      { success: allSuccessful, results },
      { status: allSuccessful ? 200 : 500 }
    );
  } catch (err) {
    console.error('Unhandled server error:', err);
    return NextResponse.json({ message: 'Internal server error', error: err }, { status: 500 });
  }
}
