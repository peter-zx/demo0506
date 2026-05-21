#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/personal-portal}"
REPO_URL="${REPO_URL:-https://github.com/peter-zx/demo0506.git}"
BRANCH="${BRANCH:-main}"

if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --all --prune
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  rm -rf "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

cp config/app.config.production.json public/app.config.json
cp deploy/personal-portal.service /etc/systemd/system/personal-portal.service
cp deploy/nginx-personal-portal.conf /etc/nginx/sites-available/personal-portal

ln -sfn /etc/nginx/sites-available/personal-portal /etc/nginx/sites-enabled/personal-portal

systemctl daemon-reload
systemctl enable personal-portal
systemctl restart personal-portal

nginx -t
systemctl reload nginx

systemctl --no-pager --full status personal-portal

