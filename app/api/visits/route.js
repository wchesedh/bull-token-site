import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use /tmp directory for Vercel compatibility
const VISITS_FILE = path.join('/tmp', 'visits.json');

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
    let data = { visits: [] };
    if (fs.existsSync(VISITS_FILE)) {
      data = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    }
    
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