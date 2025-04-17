#!/usr/bin/env bash

CONFIG="${HOME}/.config/rage_window_state.json"
mkdir -p "$(dirname "$CONFIG")"

function list_windows() {
  mapfile -t windows < <(wmctrl -lG)
  echo ""
  for i in "${!windows[@]}"; do
    line="${windows[$i]}"
    title=$(echo "$line" | cut -d ' ' -f8-)
    echo "$((i + 1)). $title"
  done
}

function select_multiple_windows_and_save() {
  list_windows
  echo ""
  echo "Enter window numbers to track (space-separated):"
  read -a indices

  jq -n '{windows: []}' > "$CONFIG" # start fresh

  for index in "${indices[@]}"; do
    if [[ "$index" =~ ^[0-9]+$ ]] && ((index >= 1 && index <= ${#windows[@]})); then
      selected="${windows[$((index - 1))]}"
      win_id=$(echo "$selected" | awk '{print $1}')
      x=$(echo "$selected" | awk '{print $3}')
      y=$(echo "$selected" | awk '{print $4}')
      w=$(echo "$selected" | awk '{print $5}')
      h=$(echo "$selected" | awk '{print $6}')
      title=$(echo "$selected" | cut -d ' ' -f8-)

      tmp=$(mktemp)
      jq --arg title "$title" --arg id "$win_id" \
         --argjson x "$x" --argjson y "$y" \
         --argjson w "$w" --argjson h "$h" \
         '.windows += [{title: $title, id: $id, x: $x, y: $y, w: $w, h: $h}]' "$CONFIG" > "$tmp" && mv "$tmp" "$CONFIG"

      echo "✅ Tracked \"$title\" at ($x,$y) ${w}x${h}"
    else
      echo "❌ Skipping invalid index: $index"
    fi
  done
}

function list_saved_windows() {
  [[ ! -f "$CONFIG" ]] && echo "⚠️ No saved state." && return 1
  count=$(jq '.windows | length' "$CONFIG")
  for ((i=0; i<count; i++)); do
    title=$(jq -r ".windows[$i].title" "$CONFIG")
    echo "$((i + 1)). $title"
  done
}

function restore_single_saved_window() {
  list_saved_windows || return
  echo ""
  read -p "Enter saved window number to restore: " n
  ((n--))

  title=$(jq -r ".windows[$n].title" "$CONFIG")
  x=$(jq -r ".windows[$n].x" "$CONFIG")
  y=$(jq -r ".windows[$n].y" "$CONFIG")
  w=$(jq -r ".windows[$n].w" "$CONFIG")
  h=$(jq -r ".windows[$n].h" "$CONFIG")

  wmctrl -lG | grep "$title" | while read -r line; do
    win_id=$(echo "$line" | awk '{print $1}')
    wmctrl -i -r "$win_id" -e "0,$x,$y,$w,$h"
    echo "✅ Restored \"$title\""
  done
}

function loop_restore_all() {
  echo "🔁 Watching for any saved windows to appear..."
  while true; do
    count=$(jq '.windows | length' "$CONFIG")
    for ((i=0; i<count; i++)); do
      title=$(jq -r ".windows[$i].title" "$CONFIG")
      x=$(jq -r ".windows[$i].x" "$CONFIG")
      y=$(jq -r ".windows[$i].y" "$CONFIG")
      w=$(jq -r ".windows[$i].w" "$CONFIG")
      h=$(jq -r ".windows[$i].h" "$CONFIG")

      wmctrl -lG | grep "$title" | while read -r line; do
        win_id=$(echo "$line" | awk '{print $1}')
        wmctrl -i -r "$win_id" -e "0,$x,$y,$w,$h"
        echo "🔧 Moved \"$title\""
      done
    done
    sleep 2
  done
}

function menu() {
  echo ""
  echo "🔥 Window Position Tracker — Multi-Window Mode"
  echo "1. Select and track multiple open windows"
  echo "2. Restore one saved window by choice"
  echo "3. Start background loop to restore all"
  echo "4. Exit"
  echo ""
  read -p "Choose an option: " choice

  case "$choice" in
    1) select_multiple_windows_and_save ;;
    2) restore_single_saved_window ;;
    3) loop_restore_all ;;
    4) exit 0 ;;
    *) echo "❌ Invalid choice" ;;
  esac
}

menu



