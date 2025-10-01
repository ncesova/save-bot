FROM oven/bun AS deps
WORKDIR /app
COPY bun.lock .
COPY package.json .
RUN bun install --frozen-lockfile

FROM oven/bun AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/bun.lock .
COPY --from=deps /app/package.json .
COPY src ./src
RUN bun build ./src/index.ts --compile --outfile app

FROM ubuntu:22.04 AS runner
WORKDIR /app
RUN mkdir -p /app/data
COPY --from=build /app/app .
ENV DB_PATH=/app/data/savebot.sqlite
CMD ["./app"]
