#!/bin/bash
cd "$(dirname "$0")"
ROOT="$(pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$PATH"

WIN="deez-math"
PORT=5204
URL="http://127.0.0.1:${PORT}"

command -v node >/dev/null || { echo "Node.js required."; read -r; exit 1; }
if [ ! -d node_modules ]; then
  echo "Installing..."
  npm install || { read -r; exit 1; }
fi

open_app() {
  "$ROOT/scripts/open-sticky-url.sh" "$URL"
}

start_in_terminal() {
  open_app
  npm run dev
  status=$?
  echo
  if [ $status -ne 0 ]; then
    echo "App failed to start."
  else
    echo "App stopped."
  fi
  echo "Press Enter to close."
  read -r
  exit $status
}

if dale-tmux-window -n "$WIN" -c "$ROOT" -- npm run dev; then
  open_app
  dale-tmux-close-launcher
  exit 0
fi

echo "tmux unavailable; running in this Terminal."
start_in_terminal
