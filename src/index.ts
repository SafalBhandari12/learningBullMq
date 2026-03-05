import { listDQL } from "./helper/dlqQueue";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": async () => {
      const data = await listDQL();
      return Response.json({ data, status: 200 });
    },
    "/:dlqJobId": async (req) => {
      const { dlqJobId } = req.params;
      console.log(dlqJobId);
      return new Response("OK", { status: 200 });
    },
  },
});

console.log(`Listening on ${server.url}`);
