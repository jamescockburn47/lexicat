#!/usr/bin/env bash

# Setup Home Hub auto-start on Raspberry Pi
# This script must be run as root (e.g. via sudo)

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Please run this script as root (sudo)"
  exit 1
fi

echo "🚀 Configuring Home Hub systemd service..."
# Write systemd service file
cat > /etc/systemd/system/home-hub.service << 'EOF'
[Unit]
Description=Home Hub Calendar Display
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/home-hub
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd and enabling service..."
systemctl daemon-reload
systemctl enable home-hub.service
systemctl restart home-hub.service

echo "🚀 Configuring Chromium kiosk autostart..."
mkdir -p /etc/xdg/lxsession/LXDE-pi
# Overwrite autostart config
cat > /etc/xdg/lxsession/LXDE-pi/autostart << 'EOF'
@chromium-browser --kiosk --disable-web-security --user-data-dir=/tmp/chrome --no-first-run http://localhost:3000
@xset s off
@xset -dpms
@xset s noblank
EOF

echo "✅ Raspberry Pi setup complete. Reboot to apply changes."
exit 0
