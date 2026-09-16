#!/usr/bin/env bash

# ==============================================================================
# BenchZero Automated Verification Script
# Autonomous Development & Deployment Protocol
# ==============================================================================

set -euo pipefail

echo "🔍 Step 1: Running production build..."
npm run build

echo "🔍 Step 2: Running strict TypeScript type checks..."
npx tsc --noEmit

echo "🔍 Step 3: Running unit tests..."
npx ng test --watch=false

echo "✅ All verification checks passed with 0 errors!"
