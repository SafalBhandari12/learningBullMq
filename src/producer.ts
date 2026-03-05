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
    jobId: urlId,
  },
);
console.log("Job added to the queue!");
