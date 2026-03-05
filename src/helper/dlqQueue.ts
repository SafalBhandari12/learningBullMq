import { webUrlDlqQueue, webUrlQueue } from "../queue";
import type { WebUrlQueueData } from "../types";

export async function listDQL() {
  const failedJobs = await webUrlDlqQueue.getFailed();
  const waitingJobs = await webUrlDlqQueue.getWaiting();

  return [...failedJobs, ...waitingJobs].map((j) => ({
    dlqJobId: j.id,
    originalJobId: j.data.originalJobId,
    originalQueue: j.data.originalQueue,
    name: j.name,
    failedReason: j.data.failedReason,
    attemptsMade: j.data.attemptsMade,
    failedAt: j.data.failedAt,
    payload: j.data.data,
  }));
}

async function requeueDlqJob(dlqJobId: string, resetPayload: WebUrlQueueData) {
  const dlqJob = await webUrlDlqQueue.getJob(dlqJobId);

  if (!dlqJob) {
    console.error(`DLQ Job not found: ${dlqJobId}`);
    return;
  }

  const newJob = await webUrlQueue.add(dlqJob.name, resetPayload, {
    jobId: dlqJob.data.originalJobId, // Reuse original job ID for idempotency
  });
  await dlqJob.remove();
  console.log(
    `Requeued DLQ job ${dlqJobId} as new job ${newJob.id} and removed from DLQ`,
  );
  return newJob.id;
}
