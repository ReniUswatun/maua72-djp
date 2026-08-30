# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Flaky registry DNS can make `npm ci` bail ("Exit handler never called!")
# while still exiting 0, leaving a broken node_modules. Retry once and verify.
# Build this stage with network access to a working resolver, e.g.
#   docker build --network=host -t siapekspor:latest .
RUN (npm ci --no-audit --no-fund || npm ci --no-audit --no-fund) \
  && test -x node_modules/.bin/next

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=1555
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 1555
CMD ["node", "server.js"]
