#!/usr/bin/env bash

# Usage: ./find_matching_paths.sh data.items "V" input.json
# TODO
# Can specify array path AND search path within array entry
# Can specify what to print from each entry
# Can specify a regex instead of exact match

set -euo pipefail

ARRAY_PATH_DOT="$1"
MATCH_VALUE="$2"
INPUT_FILE="$3"

# Convert dot path to JSON array path (e.g., "data.items" → ["data","items"])
ARRAY_PATH_JSON=$(jq -R -n --arg path "$ARRAY_PATH_DOT" '
  $path | split(".")
')

jq \
  --argjson path "$ARRAY_PATH_JSON" \
  --arg v "$MATCH_VALUE" '
  def matches_v:
    select(tostring == $v);

  getpath($path)
  | paths(scalars) as $p
  | select(getpath($p) | matches_v)
  | [$path[]] + $p
' "$INPUT_FILE"
