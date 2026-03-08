import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { webUrlDlqQueue, webUrlQueue } from "./queue";

export function createBullMqHandler() {
  const serverAdapter = new ExpressAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(webUrlQueue), new BullMQAdapter(webUrlDlqQueue)],
    serverAdapter,
  });
  serverAdapter.setBasePath("/admin/queues");

  return serverAdapter;
}
