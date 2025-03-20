import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { QueueMonitor } from '@/app/lib/queue/monitor';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await QueueMonitor.monitorAllQueues();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 