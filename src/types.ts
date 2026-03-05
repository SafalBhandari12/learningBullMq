import z from "zod";

export const webUrlQueueDataSchema = z.object({
  url: z.url(),
});

export type WebUrlQueueData = z.infer<typeof webUrlQueueDataSchema>;
