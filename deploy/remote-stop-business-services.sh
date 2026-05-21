#!/usr/bin/env bash
set -euo pipefail

DRY_RUN="${DRY_RUN:-1}"

run() {
  if [ "$DRY_RUN" = "1" ]; then
    printf '[dry-run] %q ' "$@"
    printf '\n'
  else
    "$@"
  fi
}

echo "Stopping business services. DRY_RUN=$DRY_RUN"
echo "SSH and core system services are intentionally preserved."

if command -v pm2 >/dev/null 2>&1; then
  run pm2 stop all
  run pm2 save --force
fi

if command -v docker >/dev/null 2>&1; then
  containers="$(docker ps -q || true)"
  if [ -n "$containers" ]; then
    # shellcheck disable=SC2086
    run docker stop $containers
  fi
fi

candidate_services="$(
  systemctl list-units --type=service --state=running --no-legend --no-pager \
    | awk '{print $1}' \
    | grep -Ei 'nginx|apache|httpd|node|npm|pm2|gunicorn|uvicorn|uwsgi|portal|jarvis|work|excel|vault|account|fapiao|data' \
    | grep -Evi 'ssh|sshd|systemd|network|firewalld|ufw|cron|dbus|polkit' \
    || true
)"

if [ -n "$candidate_services" ]; then
  while IFS= read -r service_name; do
    [ -z "$service_name" ] && continue
    run systemctl stop "$service_name"
    run systemctl disable "$service_name"
  done <<< "$candidate_services"
fi

echo
echo "Remaining listening ports:"
ss -lntp || netstat -lntp || true

