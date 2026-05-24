#!/usr/bin/with-contenv bashio

echo "Starting React Python Boilerplate..."

cd /app

python3 -m uvicorn backend.main:app \
  --host 0.0.0.0 \
  --port 8099