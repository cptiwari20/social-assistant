import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    // Test the connection
    await prisma.$connect();
    return NextResponse.json({ status: 'Connected to database' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 });
  }
} 