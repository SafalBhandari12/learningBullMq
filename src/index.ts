import { Elysia } from "elysia";
import { listDQL, requeueDlqJob } from "./helper/dlqQueue";
import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const htpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const app = new Elysia();
app
  .derive(() => ({
    startTime: Date.now(),
  }))
  .onAfterHandle(({ request, set, startTime }) => {
    const method = request.method;
    const route = new URL(request.url).pathname;
    const status = set.status || 200;
    console.log(`${method} ${route} - ${status}`);
    console.log(`Request duration: ${Date.now() - startTime} ms`);

    htpRequestsTotal.inc({
      method,
      route,
      status_code: status,
    });
    httpRequestDurationSeconds.observe(
      {
        method,
        route,
        status_code: status,
      },
      (Date.now() - startTime) / 1000,
    );
  });
app.get("/metrics", async () => {
  return Response.json(await register.metrics(), {
    headers: { "Content-Type": register.contentType },
  });
});
app.get("/metricsJson", async () => {
  const metrics = await register.getMetricsAsJSON();
  return Response.json(metrics);
});
app.get("/", async () => {
  const data = await listDQL();
  return { data, status: 200 };
});
app.post("/:dlqJobId", async ({ params }) => {
  await requeueDlqJob(params.dlqJobId);
  return "OK";
});
app.post("/dequeue-all", async () => {
  const jobs = await listDQL();
  for (const job of jobs) {
    await requeueDlqJob(job.dlqJobId!);
  }
  return "OK";
});

app.get("/metrics/:metricName", async ({ params }) => {
  const metric = await register.getSingleMetric(params.metricName)?.get();
  console.log(metric);
  return Response.json({ msg: "Are you lonely?", metricName: metric });
});

app.listen(3000);

console.log(`Listening on http://localhost:${app.server?.port}`);
