import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { queues } from '@/app/lib/queue/config';
import { QueueMonitor } from '@/app/lib/queue/monitor';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const failedJobs = await Promise.all(
      Object.entries(queues).map(async ([queueName, queue]) => {
        const jobs = await QueueMonitor.getFailedJobs(queue);
        return jobs.map(job => ({
          id: job.id,
          queue: queueName,
          failedReason: job.failedReason,
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
          data: job.data,
        }));
      })
    );

    return NextResponse.json(failedJobs.flat());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch failed jobs' },
      { status: 500 }
    );
  }
} 