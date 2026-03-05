import { Worker } from "bullmq";
import { connection } from "./redis";

const worker = new Worker(
  "webUrl",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
  },
  { connection: connection },
);
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});
