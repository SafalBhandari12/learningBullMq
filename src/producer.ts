import { webUrlQueue } from "./queue";

const url = "https://example.com";
const urlId = url.replaceAll(":", ""); // Sanitize URL for job ID, since
// BullMQ job IDs cannot contain certain characters like ':', '/', etc.

await webUrlQueue.add(
  "fetch",
  {
    url: url,
  },
  {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 60 * 60 * 24 * 1000, count: 1000 },
    removeOnFail: false,
    jobId: "url-" + urlId, // Unique job ID to prevent duplicates (Idempotent)
  },
);
console.log("Job added to the queue!");
