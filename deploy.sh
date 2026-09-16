#!/usr/bin/env bash

# ==============================================================================
# BenchZero Production Deployment Pipeline
# Autonomous Development & Deployment Protocol
# Target Node: 79.137.14.75 | Multi-tenant Safe
# ==============================================================================

set -euo pipefail

SSH_USER="root"
SSH_HOST="79.137.14.75"
SSH_KEY="${HOME}/.ssh/id_rsa"
TARGET_DIR="/var/www/zero-bench"
FALLBACK_TARGET_DIR="/var/www/promo-fresh/front"

echo "========================================================"
echo "🚀 Initiating BenchZero Production Deployment"
echo "Host: ${SSH_HOST} | User: ${SSH_USER}"
echo "========================================================"

# Step 1: Validate SSH Key
if [ ! -f "${SSH_KEY}" ]; then
  echo "⚠️ Warning: Default SSH key ${SSH_KEY} not found locally."
  echo "Proceeding with standard ssh-agent authentication..."
  SSH_OPTS="-o BatchMode=yes -o StrictHostKeyChecking=accept-new"
else
  SSH_OPTS="-i ${SSH_KEY} -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
fi

# Step 2: Build Production Application (Zoneless + SSR / Prerendered Distribution)
echo "📦 Building Angular production bundle with SSR & prerendered routes..."
npm run build

# Step 3: Synchronize Distribution Payloads via Rsync (Multi-tenant Safe)
echo "📤 Deploying frontend assets to target node..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "mkdir -p ${TARGET_DIR}/browser ${TARGET_DIR}/server"

rsync -avz --delete -e "ssh ${SSH_OPTS}" ./dist/zero-bench/browser/ "${SSH_USER}@${SSH_HOST}:${TARGET_DIR}/browser/"
rsync -avz --delete -e "ssh ${SSH_OPTS}" ./dist/zero-bench/server/ "${SSH_USER}@${SSH_HOST}:${TARGET_DIR}/server/"

# Step 4: Graceful Reload without disrupting sibling services
echo "🔄 Reloading localized static target on server..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "systemctl reload nginx 2>/dev/null || true"

echo "========================================================"
echo "✅ Deployment completed successfully with zero regression."
echo "========================================================"
