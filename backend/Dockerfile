# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install netcat for wait script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy wait script
COPY wait-for.sh ./
RUN chmod +x wait-for.sh

# Expose port
EXPOSE 5000

# Start server (wait for postgres, then start server - redis connection is handled gracefully)
CMD ["./wait-for.sh", "postgres", "5432", "node", "dist/server.js"]

