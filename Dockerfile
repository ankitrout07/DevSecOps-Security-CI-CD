# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first for layer caching
COPY src/app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY src/app/ .

# --- Stage 2: Production ---
FROM node:20-alpine

LABEL maintainer="Ankit"       project="DevSecOps-Blue-Green"

WORKDIR /usr/src/app

# Copy only the artifacts from the builder stage
COPY --from=builder /usr/src/app ./

# Security: Ensure the container runs as the built-in 'node' user
RUN chown -R node:node /usr/src/app
USER node

# Expose the application port
EXPOSE 8080

# Kubernetes Liveness/Readiness probe helper
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if(r.statusCode!==200)process.exit(1)})"

# Start the application
CMD ["node", "server.js"]
