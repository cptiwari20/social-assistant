import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PostPublisher } from '@/app/lib/services/PostPublisher';
import { authOptions } from '@/app/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publisher = new PostPublisher();
    await publisher.publishPost(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error publishing post:', error);
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    );
  }
} 