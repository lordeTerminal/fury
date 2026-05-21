import { Queue } from 'bullmq';
import { redis } from '../lib/redis';
import { ViolationPayload } from '../schemas/violation.schema';

export const takedownQueue = new Queue('takedown', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export async function enqueueTakedown(payload: ViolationPayload): Promise<string> {
  const jobId = `${payload.tenantId}-${payload.adId}`;

  const existingJob = await takedownQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();
    if (['waiting', 'active', 'delayed'].includes(state)) {
      return jobId;
    }
  }

  await takedownQueue.add('takedown', payload, { jobId });

  return jobId;
}
