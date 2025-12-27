#!/bin/bash
# Cleanup script for SET game Docker containers

echo "Stopping existing containers..."
sudo docker stop setgame-db setgame-redis setgame-backend setgame-frontend 2>/dev/null || true

echo "Removing existing containers..."
sudo docker rm setgame-db setgame-redis setgame-backend setgame-frontend 2>/dev/null || true

echo "Cleanup complete!"

