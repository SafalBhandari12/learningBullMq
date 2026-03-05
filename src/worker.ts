import { Worker } from "bullmq";
import { connection } from "./redis";

const worker = new Worker(
  "webUrl",
  async (job) => {
    console.log(`[attempt ${job.attemptsMade + 1}] Processing job ${job.id}`);

    if (job.attemptsMade < 2) {
      throw new Error("Simulated failure");
    }
    console.log(`Job ${job.id} processed successfully!`);
  },
  { connection: connection, concurrency: 5 },
);
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
  console.warn(
    `Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`,
  );
});
