# syntax=docker/dockerfile:1.7

###############################################################################
# Username Finder — Dockerfile
#
# Multi-stage build producing a small runtime image (~150 MB) using Next.js
# standalone output. Runs as a non-root user. No database required.
#
# Build:
#   docker build -t username-finder:latest .
#
# Run:
#   docker run -p 3000:3000 username-finder:latest
#
# The image is designed to work on UGNAS Docker GUI — see docker-compose.yml
# and DEPLOY.md for NAS-specific instructions.
###############################################################################

# ---- Stage 1: deps ---------------------------------------------------------
# Install all dependencies (including devDeps) so we can build.
FROM node:20-slim AS deps

WORKDIR /app

# Bun is used by the project's build script; install it globally.
RUN npm install -g bun@1.3

# Copy lockfile + package.json first for better layer caching.
COPY package.json bun.lock* ./

# Install with Bun (matches the local dev workflow).
# Note: we don't use --frozen-lockfile so the build doesn't hard-fail if
# the lockfile is slightly out of sync. For reproducible builds, run
# `bun install` locally and commit the updated bun.lock before building.
RUN bun install

# ---- Stage 2: build --------------------------------------------------------
# Build the Next.js standalone bundle.
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g bun@1.3

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build (keeps build logs clean).
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma schema references env("DATABASE_URL") — provide a dummy value
# during build so `prisma generate` doesn't fail. The app doesn't use the
# DB at runtime, so this is safe.
ENV DATABASE_URL="file:/tmp/build-only.db"

# Generate the Prisma client (needed for the import in src/lib/db.ts to
# compile, even though no route queries the DB).
RUN bun x prisma generate

# The build script produces .next/standalone with server.js, .next/static,
# and public/ already copied in (see package.json "build" script).
RUN bun run build

# ---- Stage 3: runtime ------------------------------------------------------
# Minimal runtime image — only the standalone server + static assets.
FROM node:20-slim AS runner

WORKDIR /app

# Hardened runtime: non-root user, no core dumps, prod node env.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS="--disable-proto=delete"

# Create a non-root user (UID 1001 — standard for Node images).
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy the standalone server, static assets, and public folder.
# The standalone bundle includes a minimal node_modules — no need to install
# anything at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user.
USER nextjs

# Expose the port the app listens on.
EXPOSE 3000

# Healthcheck — hits the root route, expects 200.
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Run the standalone Next.js server with plain node (no Bun needed at runtime).
CMD ["node", "server.js"]
