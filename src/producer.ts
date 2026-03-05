import { webUrlQueue } from "./queue";
import type { WebUrlQueueData } from "./types";

const targetUrl = "https://example.com";
const sanitizedJobId = targetUrl.replaceAll(":", ""); // Sanitize URL for job ID, since
// BullMQ job IDs cannot contain certain characters like ':', '/', etc.

const payload: WebUrlQueueData = {
  url: targetUrl,
};

await webUrlQueue.add("fetch", payload, {
  jobId: sanitizedJobId,
});
console.log("Job added to the queue!");
