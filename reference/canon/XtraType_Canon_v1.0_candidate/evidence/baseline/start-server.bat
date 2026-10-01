@echo off
cd /d %~dp0
echo XtraType: http://localhost:8787/
php -S 0.0.0.0:8787 -t server
