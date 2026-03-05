import { listDQL, requeueDlqJob } from "./helper/dlqQueue";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": async () => {
      const data = await listDQL();
      return Response.json({ data, status: 200 });
    },
    "/:dlqJobId": async (req) => {
      const { dlqJobId } = req.params;
      await requeueDlqJob(dlqJobId);
      return new Response("OK", { status: 200 });
    },
    "/dequeue-all": async () => {
      const jobs = await listDQL();
      for (const job of jobs) {
        await requeueDlqJob(job.dlqJobId!);
      }
      return new Response("OK", { status: 200 });
    },
  },
});

console.log(`Listening on ${server.url}`);
