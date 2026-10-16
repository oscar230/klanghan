# Same image runs on AWS Lambda (via the Lambda Web Adapter) and locally with `docker run`.

# Build stage (no native modules, no env vars needed at build time)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Runtime stage
FROM node:22-alpine
WORKDIR /app

# AWS Lambda Web Adapter: a Lambda extension that proxies invocations to the HTTP server below.
# It is inert outside Lambda, so the image still works with plain `docker run`.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

COPY --chown=node:node package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build

# Local storage backend (STORAGE=local): writable by the non-root user
RUN mkdir -p /app/data && chown node:node /app/data
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000
ENV AWS_LWA_PORT=3000
# Cheap, static, always-present path used by the adapter to detect that the server is up
ENV AWS_LWA_READINESS_CHECK_PATH=/robots.txt
# Lambda Function URLs set X-Forwarded-Proto; lets SvelteKit see the real https origin (CSRF check)
ENV PROTOCOL_HEADER=x-forwarded-proto
# App-level upload cap is ~4 MB (Lambda payload limit is 6 MB incl. base64); adapter-node default is 512K
ENV BODY_SIZE_LIMIT=5M
# Required at runtime (not build time): ADMIN_PASSWORD, and for S3: STORAGE=s3 (auto on Lambda) + S3_BUCKET.
# Local: docker run -e STORAGE=local -e ADMIN_PASSWORD=... -v klanghan-data:/app/data -p 3000:3000

USER node
EXPOSE 3000
CMD ["node", "build/index.js"]
