import { Firestore } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin SDK (for Storage)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID}.appspot.com`,
  });
}

// Initialize Firestore (Google Cloud client)
const firestore = new Firestore({
  projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
  credentials: {
    clientEmail: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

// Initialize Firebase Storage (via Admin SDK)
const bucket = admin.storage().bucket();

export async function POST(req: NextRequest) {
  // Validate API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, sessionId, sessionData, videoBlobBase64 } = await req.json();

    if (action === 'saveSession') {
      const docRef = firestore.collection('sessions').doc(sessionId);
      await docRef.set(sessionData);
      return NextResponse.json({ success: true, id: sessionId });
    }

    if (action === 'storeRecording') {
      // Convert base64 to Buffer and upload to Storage
      const buffer = Buffer.from(videoBlobBase64, 'base64');
      const file = bucket.file(`recordings/${sessionId}.webm`);
      await file.save(buffer, {
        metadata: { contentType: 'video/webm' },
      });
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Long expiration for simplicity
      });

      // Update session with recording URL
      const docRef = firestore.collection('sessions').doc(sessionId);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.warn(`Session ${sessionId} does not exist in Firestore`);
      } else {
        console.log(`Updating session ${sessionId} with recording URL: ${url}`);
        await docRef.set({ recordingUrl: url }, { merge: true });
      }

      return NextResponse.json({ success: true, url });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Validate API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    if (action === 'getSession') {
      const docRef = firestore.collection('sessions').doc(sessionId);
      const doc = await docRef.get();
      const session = doc.exists ? doc.data() : null;
      return NextResponse.json({ success: true, session });
    }

    if (action === 'getAllSessions') {
      const querySnapshot = await firestore
        .collection('sessions')
        .orderBy('timestamp', 'desc')
        .get();
      const sessions = querySnapshot.docs.map(doc => doc.data());
      return NextResponse.json({ success: true, sessions });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Validate API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'clearSessions') {
      const querySnapshot = await firestore.collection('sessions').get();
      const batch = firestore.batch();
      querySnapshot.docs.forEach(doc => {
        batch.set(doc.ref, { deleted: true }, { merge: true });
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Configure body parser for large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow large video blobs
    },
  },
};