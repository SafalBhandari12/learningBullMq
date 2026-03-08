# ---- Stage 1: Build ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies (leverages layer cache)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and compile both entry points
COPY . .
RUN bun run build

# ---- Stage 2: Production ----
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what is needed at runtime
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
