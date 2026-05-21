#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt update
apt install -y ca-certificates curl git nginx nodejs npm

systemctl enable nginx
systemctl start nginx

mkdir -p /opt

echo "Server bootstrap finished."

