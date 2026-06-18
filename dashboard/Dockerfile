# =============================================================================
# Dockerfile - Next.js Dashboard (Multi-stage Production Build)
# Octoparse Dashboard
# =============================================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies từ stage trước
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build production bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Stage 3: Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

# Metadata
LABEL maintainer="Octoparse Team"
LABEL description="Next.js Dashboard for Octoparse real-time data visualization"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo user non-root để chạy app (bảo mật)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ build stage
COPY --from=builder /app/public ./public

# Next.js standalone output (nếu có) hoặc full build
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Chuyển sang user non-root
USER nextjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start production server
CMD ["npm", "start"]
