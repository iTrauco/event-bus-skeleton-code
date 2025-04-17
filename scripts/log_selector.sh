#!/bin/bash

# 🔧 File: log_selector.sh
# 🗂️  Purpose: Interactive terminal logger selector with state persistence

STATE_FILE="log-trace-state.json"
SELECTION=()

# 🖍️ Color codes
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[1;35m'
RESET='\033[0m'

OPTIONS=(
  "Event Bus Communication Flow"
  "Store State Changes"
  "Component Lifecycle"
  "SVG Controller Rendering"
  "Drag System Integration"
  "✅ Proceed with selection"
  "🔁 Start Over"
  "❌ Exit"
)

declare -A TAGS=(
  ["Event Bus Communication Flow"]="EVENT"
  ["Store State Changes"]="STORE"
  ["Component Lifecycle"]="COMPONENT"
  ["SVG Controller Rendering"]="RENDER"
  ["Drag System Integration"]="DRAG"
)

# 🔄 Redraw interface
redraw_menu() {
  clear
  echo -e "${CYAN}🔧 Select areas to enable debug logging (use numbers):${RESET}\n"

  for i in "${!OPTIONS[@]}"; do
    if [[ " ${SELECTION[*]} " == *" ${OPTIONS[$i]} "* ]]; then
      echo -e "${GREEN}✔︎ [$((i+1))] ${OPTIONS[$i]}${RESET}"
    else
      echo -e "   [$((i+1))] ${OPTIONS[$i]}"
    fi
  done
  echo
}

# 🧠 Save current selection
save_state() {
  echo -e "${YELLOW}💾 Saving selected debug areas...${RESET}"
  echo -n '{ "tracking": [' > "$STATE_FILE"
  local first=true
  for name in "${SELECTION[@]}"; do
    tag="${TAGS[$name]}"
    [[ -n $tag ]] && {
      $first || echo -n ', ' >> "$STATE_FILE"
      echo -n "\"$tag\"" >> "$STATE_FILE"
      first=false
    }
  done
  echo '] }' >> "$STATE_FILE"
  echo -e "${GREEN}✅ Saved to $STATE_FILE${RESET}\n"
}

# 🧭 Menu control loop
main_menu() {
  while true; do
    redraw_menu
    read -p "Enter number to toggle selection: " choice
    index=$((choice - 1))

    if [[ $index -ge 0 && $index -lt ${#OPTIONS[@]} ]]; then
      selected="${OPTIONS[$index]}"
      case "$selected" in
        "✅ Proceed with selection")
          save_state
          echo -e "${MAGENTA}🚀 Proceeding with selected logging areas...${RESET}\n"
          break
          ;;
        "🔁 Start Over")
          SELECTION=()
          ;;
        "❌ Exit")
          echo -e "${MAGENTA}👋 Exiting. No changes made.${RESET}"
          exit 0
          ;;
        *)
          # Toggle selection
          if [[ " ${SELECTION[*]} " == *" $selected "* ]]; then
            SELECTION=("${SELECTION[@]/$selected}")
          else
            SELECTION+=("$selected")
          fi
          ;;
      esac
    else
      echo -e "${YELLOW}⚠️ Invalid input. Try again.${RESET}"
    fi
  done
}

main_menu
