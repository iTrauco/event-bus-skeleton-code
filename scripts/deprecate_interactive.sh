#!/bin/bash

set -e

# ⏰ Timestamp
timestamp=$(date +"%Y-%m-%d_%H-%M")

# 📁 Start one level above the scripts directory
start_dir="$(dirname "/home/$USER/Desktop/clean_rebuild_skeleton/scripts")"

current_dir="$start_dir"

# 🌲 Interactive navigation
navigate() {
  while true; do
    entries=()
    entries+=(".." "⬅️ Go Back")
    for item in "$current_dir"/*; do
      [ -e "$item" ] || continue
      name=$(basename "$item")
      if [ -d "$item" ]; then
        entries+=("$name/" "📁 $name")
      else
        entries+=("$name" "📄 $name")
      fi
    done

    choice=$(dialog --clear \
      --backtitle "Deprecator 9000" \
      --title "Browse: $current_dir" \
      --menu "Select file or folder:" 20 60 10 \
      "${entries[@]}" \
      3>&1 1>&2 2>&3)

    exit_status=$?
    clear

    if [ $exit_status != 0 ]; then
      echo "❌ Cancelled"
      exit 1
    fi

    if [ "$choice" == ".." ]; then
      current_dir=$(dirname "$current_dir")
    elif [[ "$choice" == */ ]]; then
      current_dir="$current_dir/${choice%/}"
    else
      full_path="$current_dir/$choice"
      deprecate_file "$full_path"
      break
    fi
  done
}

# 📦 Deprecate logic
deprecate_file() {
  file_path="$1"
  rel_path="${file_path#$start_dir/}"
  filename=$(basename "$file_path")
  filedir=$(dirname "$rel_path")

  deprecated_dir="$start_dir/deprecated/$filedir"
  mkdir -p "$deprecated_dir"

  new_name="deprecated_${filename}_${timestamp}"

  # Git metadata (if inside a repo)
  branch=""
  commit_msg=""
  file_dir=$(dirname "$file_path")
  git_root=$(git -C "$file_dir" rev-parse --show-toplevel 2>/dev/null || true)
  if [ -n "$git_root" ]; then
    branch=$(git -C "$file_dir" rev-parse --abbrev-ref HEAD)
    commit_msg=$(git -C "$file_dir" log -1 --pretty=%B)
  fi

  # Create decorated version in deprecated folder
  {
    echo "# Original path: $file_path"
    [ -n "$branch" ] && echo "# Git branch: $branch"
    [ -n "$commit_msg" ] && echo "# Last commit: $commit_msg"
    cat "$file_path"
  } > "$deprecated_dir/$new_name"

  # Replace original with a stub placeholder
  {
    echo "# UPDATE PENDING"
    [ -n "$branch" ] && echo "# Git branch: $branch"
    [ -n "$commit_msg" ] && echo "# Last commit: $commit_msg"
  } > "$file_path"

  echo "✅ Deprecated: $rel_path → deprecated/$filedir/$new_name"
}

# 🚀 Start
navigate
