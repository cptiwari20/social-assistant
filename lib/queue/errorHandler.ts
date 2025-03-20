import { Job } from 'bull';
import { prisma } from '../prisma';
import { logger } from '../logger'; // You'll need to implement this

export interface JobError extends Error {
  code?: string;
  retryable?: boolean;
}

export class JobErrorHandler {
  static async handleError(job: Job, error: JobError) {
    const { id: jobId, name: jobType, data } = job;

    logger.error(`Job ${jobId} (${jobType}) failed:`, {
      error: error.message,
      code: error.code,
      jobData: data,
      attempt: job.attemptsMade,
    });

    // Handle specific error types
    switch (error.code) {
      case 'RATE_LIMIT':
        // Retry after longer delay for rate limits
        await job.moveToDelayed(Date.now() + 60000 * Math.pow(2, job.attemptsMade));
        break;
      
      case 'AUTH_ERROR':
        // Update social account status and notify user
        if (data.socialAccountId) {
          await prisma.socialAccount.update({
            where: { id: data.socialAccountId },
            data: { status: 'AUTH_FAILED' },
          });
        }
        break;

      case 'API_ERROR':
        if (error.retryable) {
          // Retry with exponential backoff
          await job.retry();
        }
        break;
    }

    // Update post status if this is a post-related job
    if (data.postId) {
      await prisma.post.update({
        where: { id: data.postId },
        data: {
          status: 'FAILED',
          error: error.message,
          lastError: {
            message: error.message,
            code: error.code,
            timestamp: new Date(),
            attempt: job.attemptsMade,
          },
        },
      });
    }

    // Notify administrators for critical failures
    if (job.attemptsMade >= job.opts.attempts!) {
      await this.notifyAdmins(job, error);
    }
  }

  private static async notifyAdmins(job: Job, error: JobError) {
    // Implement admin notification logic (email, Slack, etc.)
    logger.critical(`Job ${job.id} failed permanently`, {
      error: error.message,
      jobType: job.name,
      jobData: job.data,
    });
  }
} 