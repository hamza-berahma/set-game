FROM node:20-alpine

WORKDIR /app

# Install netcat for wait script
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy wait script
COPY wait-for.sh ./
RUN chmod +x wait-for.sh

EXPOSE 5000

CMD ["./wait-for.sh", "postgres", "5432", "node", "dist/server.js"]
