# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Install production + dev dependencies separately so the builder stage
# can use devDeps (TypeScript, eslint, etc.) while the runner only gets prod.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Check for libc compatibility (required by some native Node addons on alpine)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
# ci installs exact versions from lock file; omit peer/optional to keep deps minimal
RUN npm ci --omit=optional

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder
# Runs `next build`. Requires ALL deps (incl. devDeps for TypeScript compiler).
# Produces .next/standalone — a self-contained Node.js server bundle.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time env vars — do NOT put secrets here; use runtime env in docker-compose
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner
# Minimal production image. Only copies:
#   .next/standalone  — the server.js + minimal node_modules (auto-traced by Next.js)
#   .next/static      — hashed client-side assets
#   public/           — static public files
#
# Final image size: ~150MB vs ~1.2GB naive single-stage.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root user for container security best practices
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# public/ is optional — only needed if you have files there
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next start is replaced by the standalone server.js entrypoint
CMD ["node", "server.js"]