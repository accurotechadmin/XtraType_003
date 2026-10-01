#!/bin/sh
set -eu
cd "$(dirname "$0")"
exec php -d upload_max_filesize=8M -d post_max_size=32M -d max_file_uploads=3 -d display_errors=0 -S 127.0.0.1:8787 -t server server/router.php
