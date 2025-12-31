#!/bin/bash
set -e

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Try to find node in common locations
if command -v node >/dev/null 2>&1; then
    exec node server.cjs
elif [ -f "/nix/var/nix/profiles/default/bin/node" ]; then
    exec /nix/var/nix/profiles/default/bin/node server.cjs
elif [ -f "$HOME/.nix-profile/bin/node" ]; then
    exec "$HOME/.nix-profile/bin/node" server.cjs
else
    echo "Error: node executable not found"
    echo "PATH: $PATH"
    which node || echo "node not in PATH"
    exit 1
fi

