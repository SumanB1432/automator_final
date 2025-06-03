// app/api/youtube/route.ts for App Router (Next.js 13+)
// OR pages/api/youtube.ts for older versions

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY as string;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'Missing query or API key' }, { status: 400 });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${q} tutorial`,
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_API_KEY,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          status: error.response?.status,
          details: error.response?.data,
        },
      },
      { status: 500 }
    );
  }
}
