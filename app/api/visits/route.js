import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VISITS_FILE = path.join(process.cwd(), 'data', 'visits.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initialize visits file if it doesn't exist
if (!fs.existsSync(VISITS_FILE)) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify({ visits: [] }));
}

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read visits' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    const visit = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };
    
    data.visits.unshift(visit);
    // Keep only the last 1000 visits
    if (data.visits.length > 1000) {
      data.visits = data.visits.slice(0, 1000);
    }
    
    fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
} 