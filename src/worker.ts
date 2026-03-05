import { Worker } from "bullmq";
import { redisConnection } from "./redis";
import "./event"; // Import event listeners

const urlFetchWorker = new Worker(
  "webUrl",
  async (job) => {
    console.log(`[attempt ${job.attemptsMade + 1}] Processing job ${job.id}`);

    if (job.attemptsMade < 2) {
      throw new Error("Simulated failure");
    }
    console.log(`Job ${job.id} processed successfully!`);
  },
  { connection: redisConnection, concurrency: 5 },
);
urlFetchWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});
urlFetchWorker.on("failed", (job, err) => {
  console.warn(
    `Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`,
  );
});
