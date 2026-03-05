import { Queue, QueueEvents } from "bullmq";
import { connection } from "./redis";

export const webUrlQueue = new Queue("webUrl", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 24 * 60 * 60, limit: 1000 },
    removeOnFail: false,
  },
});

export const webUrlEventQueue = new QueueEvents("webUrl", {
  connection,
});

export const dlqQueue = new Queue("webUrlDLQ", {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: false,
    removeOnFail: false,
  },
});
