#!/usr/bin/env bash

# ==============================================================================
# BenchZero Mock Server Deployment Pipeline
# Target Node: 79.137.14.75 | Multi-tenant Safe
# ==============================================================================

set -euo pipefail

SSH_USER="root"
SSH_HOST="79.137.14.75"
SSH_KEY="${HOME}/.ssh/id_rsa"
TARGET_DIR="/var/www/zero-bench/mock-server"
PM2_APP_NAME="zero-bench-mock"
PORT=3001

echo "========================================================"
echo "🚀 Initiating BenchZero Mock Server Deployment"
echo "Host: ${SSH_HOST} | User: ${SSH_USER}"
echo "Target Dir: ${TARGET_DIR} | PM2 Name: ${PM2_APP_NAME}"
echo "========================================================"

# Step 1: Validate SSH Configuration
if [ ! -f "${SSH_KEY}" ]; then
  echo "⚠️ Warning: SSH key ${SSH_KEY} not found locally. Using default agent..."
  SSH_OPTS="-o BatchMode=yes -o StrictHostKeyChecking=accept-new"
else
  SSH_OPTS="-i ${SSH_KEY} -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
fi

# Step 2: Ensure Remote Target Directory Exists
echo "📁 Ensuring remote target directory exists..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "mkdir -p ${TARGET_DIR}"

# Step 3: Synchronize Mock Server Code & Seeds via Rsync
echo "📤 Synchronizing mock server files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  -e "ssh ${SSH_OPTS}" \
  ./mock-server/ "${SSH_USER}@${SSH_HOST}:${TARGET_DIR}/"

# Step 4: Install Production Dependencies on Remote Host
echo "📦 Installing production dependencies on remote host..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "cd ${TARGET_DIR} && npm install --omit=dev --no-audit --no-fund"

# Step 5: Start or Restart PM2 Process
echo "🔄 Managing PM2 process (${PM2_APP_NAME})..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "
  if pm2 describe ${PM2_APP_NAME} >/dev/null 2>&1; then
    echo 'Restarting existing PM2 process ${PM2_APP_NAME}...'
    pm2 restart ${PM2_APP_NAME} --update-env
  else
    echo 'Registering and starting new PM2 process ${PM2_APP_NAME} on port ${PORT}...'
    cd ${TARGET_DIR}
    PORT=${PORT} pm2 start server.mjs --name ${PM2_APP_NAME} --time
  fi
  pm2 save
"

# Step 6: Configure UFW Firewall for Port 3001
echo "🛡️ Ensuring UFW allows port ${PORT}/tcp..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "
  if which ufw >/dev/null 2>&1; then
    ufw allow ${PORT}/tcp comment 'BenchZero Mock API' || true
  fi
"

# Step 7: Configure Nginx Reverse Proxy (Multi-Tenant Safe)
echo "🌐 Ensuring Nginx reverse proxy routing in wall-street.cloud..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" '
  NGINX_CONF="/etc/nginx/sites-available/wall-street.cloud"
  if [ -f "$NGINX_CONF" ]; then
    if ! grep -q "location /zero-bench/api/" "$NGINX_CONF"; then
      echo "Injecting BenchZero mock API block into $NGINX_CONF..."
      sed -i "/# Portfolio Angular frontend/i \\
    # BenchZero Web App\\
    location /zero-bench/ {\\
        alias /var/www/zero-bench/browser/;\\
        try_files \$uri \$uri/ /zero-bench/index.html;\\
    }\\
\\
    # BenchZero Mock API\\
    location /zero-bench/api/ {\\
        proxy_pass http://127.0.0.1:3001/api/;\\
        proxy_http_version 1.1;\\
        proxy_set_header Upgrade \$http_upgrade;\\
        proxy_set_header Connection \"upgrade\";\\
        proxy_set_header Host \$host;\\
        proxy_set_header X-Real-IP \$remote_addr;\\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\
        proxy_set_header X-Forwarded-Proto \$scheme;\\
        proxy_cache_bypass \$http_upgrade;\\
    }\\
" "$NGINX_CONF"

      nginx -t && systemctl reload nginx
      echo "✅ Nginx reloaded successfully with /zero-bench/api/ reverse proxy."
    else
      echo "ℹ️ Nginx already configured with /zero-bench/api/."
    fi
  fi
'

# Step 8: Health Check & Verification
echo "🩺 Verifying mock server health on target node..."
ssh ${SSH_OPTS} "${SSH_USER}@${SSH_HOST}" "
  echo -n 'Testing localhost:3001/api/me: '
  curl -s -f http://127.0.0.1:${PORT}/api/me | cut -c 1-80
  echo ''

  echo -n 'Testing localhost:3001/api/consultants: '
  curl -s -f http://127.0.0.1:${PORT}/api/consultants | cut -c 1-80
  echo ''

  echo -n 'Testing localhost:3001/api/metrics: '
  curl -s -f http://127.0.0.1:${PORT}/api/metrics | cut -c 1-80
  echo ''
"

echo "========================================================"
echo "✅ BenchZero Mock Server successfully deployed and active!"
echo "Direct endpoint: http://${SSH_HOST}:${PORT}/api"
echo "Secure proxy endpoint: https://${SSH_HOST}/zero-bench/api"
echo "========================================================"
