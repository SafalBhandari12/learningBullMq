import ioRedis from "ioredis";
export const connection = new ioRedis(
  process.env.REDIS_URL || "redis://localhost:6378",
  {
    maxRetriesPerRequest: null,
  },
);
