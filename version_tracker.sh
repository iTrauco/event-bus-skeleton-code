#!/bin/sh
# version_tracker.sh - Track file versions during testing

# ⏰ Timestamp
timestamp=$(date +"%Y-%m-%d_%H-%M")

# Process command line arguments
filter_ext=""
if [ $# -gt 0 ]; then
  # Check if argument is a file extension (starts with a dot)
  if echo "$1" | grep -q "^\."; then
    filter_ext="$1"
  else
    # Add dot if not provided
    filter_ext=".$1"
  fi
  echo "📄 Filtering for files with extension: $filter_ext"
fi


# Get the appropriate comment style for a file
get_comment_style() {
  file_ext=$(echo "$1" | grep -o '\.[^.]*$' || echo "")
  
  case "$file_ext" in
    .js|.ts|.jsx|.tsx|.java|.c|.cpp|.h|.cs|.php|.swift|.kt|.scala)
      echo "//"
      ;;
    .html|.xml|.svg)
      echo "<!-- " "-->>"
      ;;
    .css|.scss|.sass)
      echo "/* " " */"
      ;;
    .sql)
      echo "--"
      ;;
    .rb)
      echo "#"
      ;;
    .ps1)
      echo "#"
      ;;
    *)
      echo "#"
      ;;
  esac
}

# Start in the current directory where the script is run from
current_dir="$(pwd)"

# Main directory navigation and file selection loop
main_loop() {
  while true; do
    # Show current directory and list files
    echo "📂 Current directory: $current_dir"
    echo "Select a file to version or directory to navigate:"
    
    # Create a temp file to store the mapping
    mapping_file=$(mktemp)
    
    # Add "go back" option if not in root directory
    if [ "$current_dir" != "/" ]; then
      echo "0:BACK" >> "$mapping_file"
      echo "0: ⬅️ Go back to parent directory"
    fi
    
    # List files and directories
    index=1
    for item in "$current_dir"/*; do
      [ -e "$item" ] || continue
      name=$(basename "$item")
      
      # Apply filter if specified
      if [ -n "$filter_ext" ] && [ -f "$item" ]; then
        if ! echo "$name" | grep -q "$filter_ext$"; then
          continue
        fi
      fi
      
      # Store the mapping of index to file path
      echo "$index:$item" >> "$mapping_file"
      
      if [ -d "$item" ]; then
        echo "$index: 📁 $name/"
      else
        echo "$index: 📄 $name"
      fi
      
      index=$((index+1))
    done
    
    # Check if any files were found
    if [ "$index" -eq 1 ] && [ ! -f "$mapping_file" ]; then
      rm -f "$mapping_file"
      if [ -n "$filter_ext" ]; then
        echo "❌ No matching files found with extension $filter_ext"
      else
        echo "❌ No files found in this directory"
      fi
      exit 1
    fi
    
    echo ""
    echo "Enter the number of the file/directory (or q to quit): "
    read choice
    
    # Handle quit
    if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
      rm -f "$mapping_file"
      echo "Exiting..."
      exit 0
    fi
    
    # Handle go back
    if [ "$choice" = "0" ]; then
      current_dir=$(dirname "$current_dir")
      rm -f "$mapping_file"
      continue
    fi
    
    # Validate input is a number
    if ! echo "$choice" | grep -q "^[0-9]\+$"; then
      rm -f "$mapping_file"
      echo "❌ Invalid input. Please enter a number."
      continue
    fi
    
    # Convert to integer
    choice=$((choice))
    
    # Check if choice is in range
    if [ "$choice" -lt 1 ] || [ "$choice" -ge "$index" ]; then
      rm -f "$mapping_file"
      echo "❌ Invalid choice. Please enter a number between 1 and $((index-1))."
      continue
    fi
    
    # Get the chosen item path from the mapping file
    chosen_file=$(grep "^$choice:" "$mapping_file" | cut -d':' -f2-)
    rm -f "$mapping_file"
    
    # Check if item exists
    if [ ! -e "$chosen_file" ]; then
      echo "❌ Invalid selection. Item not found."
      continue
    fi
    
    # If directory, navigate to it
    if [ -d "$chosen_file" ]; then
      current_dir="$chosen_file"
      continue
    fi
    
    # If file, break loop and proceed to processing
    if [ -f "$chosen_file" ]; then
      break
    fi
  done
}

# Run the main loop to select a file
main_loop

# Process the file
file_path="$chosen_file"
filename=$(basename "$file_path")
filedir=$(dirname "$file_path")

# Check if already versioned
if echo "$filename" | grep -q "^orig\."; then
  echo "❌ This is already a versioned file. Please select the original file instead."
  exit 1
fi

# Parse filename and extension
base_name="$filename"
extension=""

# Extract the extension if it exists
if echo "$filename" | grep -q "\."; then
  base_name=$(echo "$filename" | sed 's/\.[^.]*$//')
  extension=$(echo "$filename" | sed 's/^.*\(\.[^.]*\)$/\1/')
fi

# Get comment style for this file type
comment_start=$(get_comment_style "$filename" | awk '{print $1}')
comment_end=$(get_comment_style "$filename" | awk '{print $2}')

# Git metadata (if inside a repo)
branch=""
commit_msg=""
if command -v git >/dev/null 2>&1; then
  git_root=$(git -C "$filedir" rev-parse --show-toplevel 2>/dev/null || true)
  if [ -n "$git_root" ]; then
    branch=$(git -C "$filedir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    commit_msg=$(git -C "$filedir" log -1 --pretty=%B 2>/dev/null || echo "")
  fi
fi

# Determine version number by checking for existing versions
base_versioned_prefix="orig.$base_name"

# Check if any orig files already exist
highest_v=0
if ls "${filedir}/${base_versioned_prefix}"* 1>/dev/null 2>&1; then
  # Find the highest version number
  for vfile in "${filedir}/${base_versioned_prefix}"*; do
    vname=$(basename "$vfile")
    if echo "$vname" | grep -q "\.v[0-9]\+"; then
      v_num=$(echo "$vname" | sed 's/.*\.v\([0-9]\+\).*/\1/')
      if [ "$v_num" -gt "$highest_v" ]; then
        highest_v=$v_num
      fi
    fi
  done
  
  # If no v# format found but orig exists, start with v1
  if [ $highest_v -eq 0 ] && ls "${filedir}/${base_versioned_prefix}_"* 1>/dev/null 2>&1; then
    next_v=1
  else
    next_v=$((highest_v + 1))
  fi
  
  # Place timestamp before the extension
  if [ -n "$extension" ]; then
    versioned_name="${base_versioned_prefix}.v${next_v}_${timestamp}${extension}"
  else
    versioned_name="${base_versioned_prefix}.v${next_v}_${timestamp}"
  fi
else
  # First version - no v number needed
  if [ -n "$extension" ]; then
    versioned_name="${base_versioned_prefix}_${timestamp}${extension}"
  else
    versioned_name="${base_versioned_prefix}_${timestamp}"
  fi
fi

versioned_path="${filedir}/${versioned_name}"

# Copy original to versioned file with metadata
{
  echo "${comment_start} Original file: $filename ${comment_end}"
  echo "${comment_start} Version date: $(date) ${comment_end}"
  [ -n "$branch" ] && echo "${comment_start} Git branch: $branch ${comment_end}"
  [ -n "$commit_msg" ] && echo "${comment_start} Last commit: $commit_msg ${comment_end}"
  echo ""
  cat "$file_path"
} > "$versioned_path"

# Empty the original file but add metadata header
{
  echo "${comment_start} NEW VERSION - Original backed up to: $versioned_name ${comment_end}"
  echo "${comment_start} Version date: $(date) ${comment_end}"
  [ -n "$branch" ] && echo "${comment_start} Git branch: $branch ${comment_end}"
  [ -n "$commit_msg" ] && echo "${comment_start} Last commit: $commit_msg ${comment_end}"
} > "$file_path"

echo "✅ Versioned: $filename → $versioned_name"
echo "Original file emptied and ready for new content"