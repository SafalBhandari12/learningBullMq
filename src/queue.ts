import { Queue } from "bullmq";
import { connection } from "./redis";

export const webUrlQueue = new Queue("webUrl", { connection });
