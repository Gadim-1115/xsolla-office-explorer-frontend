#!/bin/sh
set -eu

json_string() {
  printf '%s' "${1:-}" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\r//g'
}

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "$(json_string "${VITE_API_BASE_URL:-}")",
  VITE_LMS_APP_URL: "$(json_string "${VITE_LMS_APP_URL:-}")",
  VITE_LMS_API_URL: "$(json_string "${VITE_LMS_API_URL:-}")"
};
EOF
