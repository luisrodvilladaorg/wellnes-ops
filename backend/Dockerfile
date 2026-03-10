# ==========================
# Backend API - Base
# ==========================

# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy project manifests
COPY package*.json ./

# Install dependencies (conditional for dev or prod)
# If environment is prod, omit development dependencies
ARG NODE_ENV=production
RUN npm install --omit=dev # Production dependencies only
RUN [ "$NODE_ENV" = "production" ] || npm install # Reinstall in dev to include devDependencies

# Copy source code
COPY src ./src
COPY test ./test


# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy built app
COPY --from=build /app ./

# Set default environment variables
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000

# Expose port (adjustable via Docker Compose)
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Default command to start the server
CMD ["node", "src/server.js"]