#!/bin/sh
set -eu

PORT_TO_USE="${PORT:-8080}"
API_URL="${VITE_API_URL:-${VITE_API_BASE_URL:-${VITE_API_PROXY_TARGET:-}}}"
GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-}"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${API_URL}",
  VITE_GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}"
};
EOF

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
  listen ${PORT_TO_USE};
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

exec nginx -g 'daemon off;'
