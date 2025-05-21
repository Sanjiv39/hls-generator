#!/bin/bash

CODEC="$1"

# Validate codec
if [ -z "$CODEC" ]; then
  echo '{"error": "No codec provided"}'
  exit 1
fi

# Check encoder exists
if ! ffmpeg -hide_banner -encoders 2>/dev/null | grep -q "\b$CODEC\b"; then
  echo "{\"error\": \"Codec '$CODEC' not found\"}"
  exit 1
fi

# Get encoder help
ENCODER_HELP=$(ffmpeg -hide_banner -h encoder="$CODEC" 2>/dev/null)

# Check for preset support
if ! echo "$ENCODER_HELP" | grep -q "\-preset"; then
  echo "{\"codec\": \"$CODEC\", \"presets\": []}"
  exit 0
fi

# Extract supported presets
PRESETS_LINE=$(echo "$ENCODER_HELP" | grep -A1 "\-preset" | tail -n1)

# Parse JSON
PRESETS=$(echo "$PRESETS_LINE" | sed 's/.*Supported: //' | tr ' ' '\n' | sed 's/^/  "/;s/$/",' | sed '$ s/,$//')

echo "{"
echo "  \"codec\": \"$CODEC\","
echo "  \"presets\": ["
echo "$PRESETS"
echo "  ]"
echo "}"
