# multi-stage Dockerfile for Next.js (build then runtime)
# Replace WORKDIR /app and adjust CMD if your start script differs.

################################
# Builder stage (build the app)
################################
FROM --platform=$BUILDPLATFORM node:22-slim AS builder
ARG TARGETPLATFORM
ARG BUILDPLATFORM

WORKDIR /app

# Install build tools and rust for native modules
RUN apt-get update && \
    apt-get install -y python3 make g++ curl build-essential ca-certificates && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . "$HOME/.cargo/env" || true && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install ALL deps (including dev) for the build
COPY package*.json ./
# Install everything (dev + prod) so build works
RUN npm ci

# Copy source and rebuild native modules if necessary
COPY . .
# Try to update binary, fallback to build-from-source if needed
RUN . "$HOME/.cargo/env" 2>/dev/null || true && \
    npm rebuild lightningcss --update-binary || npm rebuild lightningcss --build-from-source || true

# Build the Next.js app
RUN npm run build

################################
# Production stage (runtime)
################################
FROM node:22-slim AS runner
WORKDIR /app

# Copy only production package files and install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# If you have next.config.js or other runtime files, copy them too:
COPY --from=builder /app/next.config.ts ./next.config.ts

ENV NODE_ENV=production
EXPOSE 3000
# Use your production start (next start or custom)
CMD ["npm", "start"]