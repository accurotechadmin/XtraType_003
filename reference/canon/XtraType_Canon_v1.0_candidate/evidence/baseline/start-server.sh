#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
echo "XtraType: http://localhost:8787/"
exec php -S 0.0.0.0:8787 -t server
