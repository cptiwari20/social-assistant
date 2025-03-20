import { Queue, Job } from 'bull';
import { queues } from './config';
import { logger } from '../logger';

export class QueueMonitor {
  static async getFailedJobs(queue: Queue): Promise<Job[]> {
    return await queue.getFailed();
  }

  static async retryFailedJobs(queue: Queue): Promise<void> {
    const failedJobs = await this.getFailedJobs(queue);
    for (const job of failedJobs) {
      await job.retry();
    }
  }

  static async cleanOldJobs(queue: Queue, age: number): Promise<void> {
    await queue.clean(age);
    logger.info(`Cleaned jobs older than ${age}ms from ${queue.name}`);
  }

  static async getQueueMetrics(queue: Queue) {
    const [
      activeCount,
      completedCount,
      failedCount,
      delayedCount,
      waitingCount,
    ] = await Promise.all([
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getWaitingCount(),
    ]);

    return {
      name: queue.name,
      active: activeCount,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      waiting: waitingCount,
    };
  }

  static async monitorAllQueues() {
    const metrics = await Promise.all(
      Object.values(queues).map(queue => this.getQueueMetrics(queue))
    );

    logger.info('Queue metrics:', { metrics });
    return metrics;
  }
} 