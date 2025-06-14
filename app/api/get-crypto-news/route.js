import { NextResponse } from 'next/server';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;

export async function GET() {
  try {
    const response = await fetch(
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      {
        headers: {
          'Authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news from CryptoCompare');
    }

    const data = await response.json();
    return NextResponse.json(data.Data);
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto news' },
      { status: 500 }
    );
  }
} 