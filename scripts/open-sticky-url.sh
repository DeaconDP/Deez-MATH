#!/bin/bash
# Focus an existing Brave tab for this sticky URL, or open one tab once.
set -euo pipefail
URL="${1:?url required}"
PREFIX="${URL%/}"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if osascript \
  -e 'on run argv' \
  -e 'set theURL to item 1 of argv' \
  -e 'set thePrefix to item 2 of argv' \
  -e 'tell application "Brave Browser"' \
  -e '  activate' \
  -e '  if (count of windows) is 0 then make new window' \
  -e '  set found to false' \
  -e '  set winIndex to 1' \
  -e '  repeat with w in windows' \
  -e '    set tabIndex to 1' \
  -e '    repeat with t in tabs of w' \
  -e '      if (URL of t as text) starts with thePrefix then' \
  -e '        set active tab index of w to tabIndex' \
  -e '        set index of w to 1' \
  -e '        set found to true' \
  -e '        exit repeat' \
  -e '      end if' \
  -e '      set tabIndex to tabIndex + 1' \
  -e '    end repeat' \
  -e '    if found then exit repeat' \
  -e '    set winIndex to winIndex + 1' \
  -e '  end repeat' \
  -e '  if not found then' \
  -e '    tell window 1 to make new tab with properties {URL:theURL}' \
  -e '  end if' \
  -e 'end tell' \
  -e 'end run' \
  -- "$URL" "$PREFIX"
then
  exit 0
fi

open "$URL"
