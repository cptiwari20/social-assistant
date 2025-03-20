import Queue from 'bull';

export const queues = {
  postScheduler: new Queue('post-scheduler', process.env.REDIS_URL!, {
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
  socialMediaSync: new Queue('social-media-sync', process.env.REDIS_URL!, {
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
}; 