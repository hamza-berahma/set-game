# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and config
COPY . .

# Build argument for API URL (Railway will pass this as build arg from env var)
# Railway automatically passes environment variables as build arguments
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Verify build arg is set (for debugging)
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# Build application (VITE_API_URL will be embedded in the bundle)
RUN npm run build

# Production stage with Node.js server
FROM node:20-alpine

WORKDIR /app

# Copy built files, server script, and package.json (needed for Railway)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./
COPY --from=builder /app/package.json ./

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start Node.js server directly (don't use npm)
CMD ["node", "server.cjs"]

