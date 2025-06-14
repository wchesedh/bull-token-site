import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

let cachedNews = null;
let lastFetchTime = 0;

export async function GET() {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Return cached data if it's still valid
    if (cachedNews && (currentTime - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedNews);
    }

    const response = await fetch(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      {
        headers: {
          'Authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
        },
        next: { revalidate: CACHE_DURATION } // Next.js cache
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news from CryptoCompare');
    }

    const data = await response.json();
    
    // Update cache
    cachedNews = data.Data;
    lastFetchTime = currentTime;

    return NextResponse.json(data.Data);
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    
    // If we have cached data, return it even if expired
    if (cachedNews) {
      return NextResponse.json(cachedNews);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch crypto news' },
      { status: 500 }
    );
  }
} 