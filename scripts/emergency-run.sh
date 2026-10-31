#!/usr/bin/env bash
# Run the site without Docker and without Vercel — docs/emergency-hosting.md.
# Needs Node.js 22 and a filled-in .env.emergency next to package.json.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env.emergency ] || { echo "Missing .env.emergency (copy .env.emergency.example and fill it in)."; exit 1; }
set -a; . ./.env.emergency; set +a

echo "1/3 Installing packages…"
npm ci --no-audit --no-fund

echo "2/3 Building…"
NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1 npm run build
cp -r public .next/standalone/
mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/

echo "3/3 Starting on http://localhost:${PORT:-3000}"
cd .next/standalone
# HOSTNAME must stay 0.0.0.0: a specific address there makes the locale
# redirect point back at itself.
PORT="${PORT:-3000}" HOSTNAME=0.0.0.0 NODE_ENV=production exec node server.js
