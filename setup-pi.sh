#!/usr/bin/env bash

#
# setup-pi.sh: configure Raspberry Pi auto-start for Home Hub
# Usage:
#   sudo ./setup-pi.sh [--kiosk-only <url>]
#
#   (no args): install systemd service to run full Home Hub (backend + frontend dev)
#   --kiosk-only <url>: skip backend; launch Chromium kiosk to <url>

# verify root
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Please run this script as root (sudo)"
  exit 1
fi

# parse mode
MODE="all-in-one"
KIOSK_URL="http://localhost:5173"
if [ "$1" = "--kiosk-only" ]; then
  if [ -z "$2" ]; then
    echo "Usage: sudo $0 --kiosk-only <url>"
    exit 1
  fi
  MODE="kiosk-only"
  KIOSK_URL="$2"
fi

# summary
echo "🚀 Raspberry Pi auto-start setup ($MODE mode)"
# Write systemd service file
cat > /etc/systemd/system/home-hub.service << 'EOF'
[Unit]
Description=Home Hub Calendar Display (dev mode)
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/home-hub
# Run the startup script which launches both backend and frontend (dev proxy on 5173)
ExecStart=/bin/bash /home/pi/home-hub/start-home-hub.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd and enabling service..."
systemctl daemon-reload
systemctl enable home-hub.service
systemctl restart home-hub.service

echo "🚀 Configuring Chromium kiosk autostart to $KIOSK_URL..."
mkdir -p /etc/xdg/lxsession/LXDE-pi
cat > /etc/xdg/lxsession/LXDE-pi/autostart << EOF
@chromium-browser --kiosk --disable-web-security --user-data-dir=/tmp/chrome --no-first-run $KIOSK_URL
@xset s off
@xset -dpms
@xset s noblank
EOF

echo "✅ Raspberry Pi setup complete. Reboot to apply changes."
exit 0
