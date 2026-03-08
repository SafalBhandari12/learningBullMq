import express from "express";
import type { Request, Response, NextFunction } from "express";
import { listDQL, requeueDlqJob } from "./helper/dlqQueue";
import client from "prom-client";
import { createBullMqHandler } from "./bullboard";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
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

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const method = req.method;
    const route = req.path;
    const status = res.statusCode;
    console.log(`${method} ${route} - ${status}`);
    console.log(`Request duration: ${Date.now() - startTime} ms`);
    httpRequestsTotal.inc({ method, route, status_code: status });
    httpRequestDurationSeconds.observe(
      { method, route, status_code: status },
      (Date.now() - startTime) / 1000,
    );
  });
  next();
});

const bullBoardAdapter = createBullMqHandler();
app.use("/admin/queues", bullBoardAdapter.getRouter());

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.get("/metricsJson", async (req: Request, res: Response) => {
  res.json(await register.getMetricsAsJSON());
});

app.get("/", async (req: Request, res: Response) => {
  const data = await listDQL();
  res.json({ data, status: 200 });
});

app.post("/dequeue-all", async (req: Request, res: Response) => {
  const jobs = await listDQL();
  for (const job of jobs) {
    await requeueDlqJob(job.dlqJobId!);
  }
  res.send("OK");
});

app.post("/:dlqJobId", async (req: Request, res: Response) => {
  if (!req.params.dlqJobId) {
    res.status(400).json({ error: "dlqJobId is required" });
    return;
  }
  await requeueDlqJob(req.params.dlqJobId as string);
  res.send("OK");
});

app.get("/metrics/:metricName", async (req: Request, res: Response) => {
  const metric = await register
    .getSingleMetric(req.params.metricName as string)
    ?.get();
  console.log(metric);
  res.json({ msg: "Are you lonely?", metricName: metric });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
