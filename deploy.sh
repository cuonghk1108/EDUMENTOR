#!/bin/bash
# Simple deployment helper script for VPS: 103.139.154.65
# Usage from your local machine (Git Bash / WSL / Cygwin):
#   ./deploy.sh <user> <path-on-vps>
# e.g. ./deploy.sh ubuntu /var/www/myapp

# --- configuration -------------------------------------------------
VPS_IP="103.139.154.65"
REPO_URL="https://github.com/your/repo.git"   # set to your git repo
# -------------------------------------------------------------------

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <vps-user> <target-path>"
  exit 1
fi

USER=$1
TARGET=$2

set -e

# create target dir on VPS if needed
ssh ${USER}@${VPS_IP} "mkdir -p ${TARGET} && chown ${USER}:${USER} ${TARGET}"

# push code (using rsync to exclude node_modules, build, .git etc.)
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='frontend/build' \
      --exclude='*.pyc' --exclude='__pycache__' ./ ${USER}@${VPS_IP}:${TARGET}/

# run setup commands on VPS
ssh ${USER}@${VPS_IP} bash <<'EOF'
set -e
cd ${TARGET}

# pull latest from repo if exists
if [ -d .git ]; then
  git pull
else
  git clone ${REPO_URL} .
fi

# backend npm dependencies
if [ -f backend/package.json ]; then
  cd backend
  npm ci
  cd ..
fi

# frontend build
if [ -f frontend/package.json ]; then
  cd frontend
  npm ci
  npm run build
  cd ..
fi

# python virtualenv for celery (adjust path as needed)
if command -v python3 >/dev/null 2>&1; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r celery/requirements.txt || true
  deactivate
fi

# optionally restart services (pm2/systemd)
# pm2 reload all
# sudo systemctl restart myapp.service

EOF

echo "Deployment to ${VPS_IP} completed."
