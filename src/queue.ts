import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "./redis";


const webUrlQueueConfig = {
  attempts: 2,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 24 * 60 * 60, limit: 1000 },
  removeOnFail: false,
};

export const webUrlQueue = new Queue("webUrl", {
  connection: redisConnection,
  defaultJobOptions: webUrlQueueConfig,
});

export const webUrlEventQueue = new QueueEvents("webUrl", {
  connection: redisConnection,
});

export const webUrlDlqQueue = new Queue("webUrlDLQ", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: false,
    removeOnFail: false,
  },
});
