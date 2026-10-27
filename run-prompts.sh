#!/usr/bin/env bash
# Usage (inside this folder):  bash run-prompts.sh 1 4   -> runs prompts 1 to 4
FROM=${1:-1}; TO=${2:-$FROM}
[ -d .git ] || { git init -q; git add -A; git commit -qm "start"; }
grep -E '^[0-9]+\. ' PROMPTS.md | while IFS= read -r line; do
  n=${line%%.*}
  [ "$n" -lt "$FROM" ] || [ "$n" -gt "$TO" ] && continue
  p=${line#*. }
  echo "=== Prompt $n : $p ==="
  claude -p "$p" --permission-mode acceptEdits --allowedTools "Read,Write,Edit,Bash(npm *),Bash(node *)"
  git add -A; git commit -qm "prompt $n"
done
