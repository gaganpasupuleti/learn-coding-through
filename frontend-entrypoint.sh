#!/bin/sh
set -eu

PORT_TO_USE="${PORT:-8080}"
RAW_API="${VITE_API_URL:-${VITE_API_BASE_URL:-${VITE_API_PROXY_TARGET:-}}}"
RAW_API=$(printf '%s' "$RAW_API" | sed 's|[[:space:]]||g')
GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-}"
RAW_JOBS_API="${VITE_JOBS_API_URL:-}"
RAW_JOBS_API=$(printf '%s' "$RAW_JOBS_API" | sed 's|[[:space:]]||g')
CLIENT_VISIBLE_JOBS_API_URL=""

if [ -n "$RAW_JOBS_API" ] && printf '%s' "$RAW_JOBS_API" | grep -qE '^https?://' && ! printf '%s' "$RAW_JOBS_API" | grep -q '<'; then
  CLIENT_VISIBLE_JOBS_API_URL=$(printf '%s' "$RAW_JOBS_API" | sed 's|/*$||')
fi

ENABLE_PROXY=false
CLIENT_VISIBLE_API_URL="$RAW_API"
API_ORIGIN=""
HOST_HEADER=""

if [ -n "$RAW_API" ] && printf '%s' "$RAW_API" | grep -qE '^https?://' && ! printf '%s' "$RAW_API" | grep -q '<'; then
  ENABLE_PROXY=true
  API_ORIGIN=$(printf '%s' "$RAW_API" | sed 's|/*$||')
  HOST_HEADER=$(printf '%s' "$API_ORIGIN" | sed -e 's|^https\?://||' -e 's|/.*$||')
  # Browser calls same-origin /api and /health; nginx forwards to FastAPI (avoids SPA index.html on /api/*).
  CLIENT_VISIBLE_API_URL=""
fi

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${CLIENT_VISIBLE_API_URL}",
  VITE_GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}",
  VITE_JOBS_API_URL: "${CLIENT_VISIBLE_JOBS_API_URL}",
  VITE_JOBS_ADMIN_API_KEY: ""
};
EOF

if [ "$ENABLE_PROXY" = true ]; then
  cat > /etc/nginx/conf.d/default.conf <<EOF
server {
  listen ${PORT_TO_USE};
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass ${API_ORIGIN};
    proxy_http_version 1.1;
    proxy_set_header Host ${HOST_HEADER};
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_ssl_server_name on;
  }

  location /health {
    proxy_pass ${API_ORIGIN};
    proxy_http_version 1.1;
    proxy_set_header Host ${HOST_HEADER};
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_ssl_server_name on;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF
else
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
fi

nginx -t

exec nginx -g 'daemon off;'
