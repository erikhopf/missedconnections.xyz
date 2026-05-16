#!/usr/bin/env bash
#
# Deploy missedconnections.xyz:
#   1. Build episodes.json + episodes.js from episodes.yaml
#   2. Sync files to S3
#   3. Invalidate CloudFront cache
#
# Usage: ./deploy.sh

set -euo pipefail

# Load environment variables
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi

: "${BUCKET:?BUCKET is not set. Add it to .env or export it before running.}"
: "${DISTRIBUTION_ID:?DISTRIBUTION_ID is not set. Add it to .env or export it before running.}"

echo "→ Building episodes..."
npm run build

echo "→ Uploading to s3://${BUCKET}..."
aws s3 sync . "s3://${BUCKET}" --delete \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "scripts/*" \
  --exclude "package*.json" \
  --exclude ".DS_Store" \
  --exclude "README.md" \
  --exclude "deploy.sh"

echo "→ Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*"

echo "✓ Done."