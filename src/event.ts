import { webUrlDlqQueue, webUrlEventQueue, webUrlQueue } from "./queue";

webUrlEventQueue.on("failed", async ({ jobId, failedReason }) => {
  const job = await webUrlQueue.getJob(jobId);
  console.log(`Received failed event for job ${jobId}: ${failedReason}`);
  if (!job) {
    console.error(`Failed job not found: ${jobId}`);
    return;
  }
  console.error(`Job ${jobId} failed: ${failedReason}`);
  const maxAttempts = job.opts.attempts || 1;
  const attemptsMade = job.attemptsMade || 0;
  if (attemptsMade < maxAttempts) {
    return;
  }
  console.log("Moving job from webUrlQueue to DLQ");
  await webUrlDlqQueue.add(job.name, {
    originalJobId: job.id,
    originalQueue: job.queueName,
    data: job.data,
    failedReason,
    attemptsMade,
    failedAt: new Date().toISOString(),
  });
  await job.remove();
  console.log(`Job ${jobId} moved to DLQ and removed from main queue`);
});
