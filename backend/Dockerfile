# Backend Dockerfile

# -----------------------
# Stage 1: Builder
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# -----------------------
# Stage 2: Production
# -----------------------
FROM node:20-alpine

# Install netcat for wait script
RUN apk update && apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy migrations directory (needed for migration script)
COPY migrations ./migrations

# Copy wait script
COPY wait-for.sh ./
RUN chmod +x wait-for.sh

# Expose port
EXPOSE 5000

# Start server (wait for postgres)
CMD ["./wait-for.sh", "postgres", "5432", "node", "dist/server.js"]