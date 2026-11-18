#!/usr/bin/env bash
# Netlify build step. Refuses to build while netlify.toml still points at the placeholder backend
# address — otherwise the site would deploy "successfully" but every API call would fail.
set -e
if grep -Eq '^[[:space:]]*to[[:space:]]*=.*REPLACE-WITH' netlify.toml; then
  echo "================================================================"
  echo "BUILD STOPPED: netlify.toml still contains REPLACE-WITH-YOUR-RAILWAY-DOMAIN."
  echo "Open netlify.toml, replace it (in BOTH places) with your Railway backend"
  echo "domain, commit, push, and Netlify will redeploy."
  echo "================================================================"
  exit 1
fi
cd frontend
npm install
npm run build
