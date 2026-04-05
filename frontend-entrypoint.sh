#!/bin/sh
set -eu

PORT_TO_USE="${PORT:-8080}"

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
