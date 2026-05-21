#!/usr/bin/env bash
set -euo pipefail

echo "== host =="
hostnamectl || hostname

echo
echo "== listening tcp ports =="
ss -lntp || netstat -lntp

echo
echo "== nginx sites =="
find /etc/nginx -maxdepth 3 -type f \( -path "*/sites-enabled/*" -o -path "*/conf.d/*" \) -print 2>/dev/null || true

echo
echo "== systemd services likely related to web apps =="
systemctl list-units --type=service --state=running --no-pager \
  | grep -Ei "nginx|apache|httpd|node|npm|pm2|python|gunicorn|uvicorn|uwsgi|docker|podman|mysql|mariadb|postgres|redis|mongo|portal|jarvis|work|excel|vault|account|fapiao|data" \
  || true

echo
echo "== pm2 =="
if command -v pm2 >/dev/null 2>&1; then
  pm2 list
else
  echo "pm2 not installed"
fi

echo
echo "== docker =="
if command -v docker >/dev/null 2>&1; then
  docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
else
  echo "docker not installed"
fi

echo
echo "== /opt directories =="
find /opt -maxdepth 2 -type d -print 2>/dev/null || true

