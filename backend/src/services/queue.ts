import { Queue } from 'bullmq';
import Redis from 'ioredis';

let connection: Redis;

export function getRedisConnection(): Redis {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

export const assessmentQueue = new Queue('assessment-generation', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function addGenerationJob(assignmentId: string, data: object) {
  const job = await assessmentQueue.add(
    'generate',
    { assignmentId, ...data },
    { jobId: `gen-${assignmentId}-${Date.now()}` }
  );
  return job;
}
