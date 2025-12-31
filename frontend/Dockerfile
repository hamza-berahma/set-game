# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and config
COPY . .

# Build argument for API URL
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage with Node.js server
FROM node:20-alpine

WORKDIR /app

# Copy built files and server script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start Node.js server
CMD ["node", "server.cjs"]

