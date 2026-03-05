import { webUrlQueue } from "./queue";

await webUrlQueue.add("fetch", {
  url: "https://example.com",
});
console.log("Job added to the queue!");
