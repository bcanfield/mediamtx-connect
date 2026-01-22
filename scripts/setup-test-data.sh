#!/bin/bash
# Setup test data for local development and e2e testing
# This script creates mock recordings and screenshots directories

set -e

TEST_DATA_DIR="./test-data"
RECORDINGS_DIR="$TEST_DATA_DIR/recordings"
SCREENSHOTS_DIR="$TEST_DATA_DIR/screenshots"

echo "Setting up test data directories..."

# Create directories
mkdir -p "$RECORDINGS_DIR/camera1"
mkdir -p "$RECORDINGS_DIR/camera2"
mkdir -p "$RECORDINGS_DIR/living-room"
mkdir -p "$SCREENSHOTS_DIR/camera1"
mkdir -p "$SCREENSHOTS_DIR/camera2"
mkdir -p "$SCREENSHOTS_DIR/living-room"

# Function to create a minimal valid MP4 file using ffmpeg
create_test_video() {
  local output_file="$1"
  local duration="${2:-2}"

  if [ -f "$output_file" ]; then
    echo "  Skipping $output_file (already exists)"
    return
  fi

  echo "  Creating $output_file..."

  # Check if ffmpeg is available
  if command -v ffmpeg &> /dev/null; then
    # Create a simple test video with color bars
    ffmpeg -y -f lavfi -i "color=c=blue:s=320x240:d=$duration" \
      -f lavfi -i "anullsrc=r=44100:cl=stereo" \
      -t "$duration" \
      -c:v libx264 -preset ultrafast -crf 28 \
      -c:a aac -b:a 64k \
      -movflags +faststart \
      "$output_file" 2>/dev/null
  else
    # Fallback: create an empty placeholder file
    echo "Warning: ffmpeg not found, creating placeholder file"
    touch "$output_file"
  fi
}

# Function to create a test screenshot
create_test_screenshot() {
  local output_file="$1"

  if [ -f "$output_file" ]; then
    echo "  Skipping $output_file (already exists)"
    return
  fi

  echo "  Creating $output_file..."

  # Check if ffmpeg is available
  if command -v ffmpeg &> /dev/null; then
    # Create a simple test image
    ffmpeg -y -f lavfi -i "color=c=blue:s=320x240:d=1" \
      -frames:v 1 \
      "$output_file" 2>/dev/null
  else
    # Fallback: create a minimal valid PNG (1x1 blue pixel)
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$output_file"
  fi
}

echo "Creating test recordings for camera1..."
create_test_video "$RECORDINGS_DIR/camera1/2024-01-15_10-30-00.mp4" 3
create_test_video "$RECORDINGS_DIR/camera1/2024-01-15_14-45-30.mp4" 2
create_test_video "$RECORDINGS_DIR/camera1/2024-01-16_08-00-00.mp4" 2

echo "Creating test recordings for camera2..."
create_test_video "$RECORDINGS_DIR/camera2/2024-01-15_12-00-00.mp4" 2
create_test_video "$RECORDINGS_DIR/camera2/2024-01-16_09-15-00.mp4" 2

echo "Creating test recordings for living-room..."
create_test_video "$RECORDINGS_DIR/living-room/2024-01-14_20-00-00.mp4" 2
create_test_video "$RECORDINGS_DIR/living-room/2024-01-15_18-30-00.mp4" 2
create_test_video "$RECORDINGS_DIR/living-room/2024-01-16_07-00-00.mp4" 2
create_test_video "$RECORDINGS_DIR/living-room/2024-01-16_19-45-00.mp4" 2

echo "Creating test screenshots..."
create_test_screenshot "$SCREENSHOTS_DIR/camera1/2024-01-15_10-30-00.png"
create_test_screenshot "$SCREENSHOTS_DIR/camera1/2024-01-15_14-45-30.png"
create_test_screenshot "$SCREENSHOTS_DIR/camera2/2024-01-15_12-00-00.png"
create_test_screenshot "$SCREENSHOTS_DIR/living-room/2024-01-14_20-00-00.png"

echo ""
echo "Test data setup complete!"
echo ""
echo "Directory structure:"
find "$TEST_DATA_DIR" -type f | head -20
echo ""
echo "Summary:"
echo "  - Recordings: $(find "$RECORDINGS_DIR" -name "*.mp4" | wc -l) files"
echo "  - Screenshots: $(find "$SCREENSHOTS_DIR" -name "*.png" | wc -l) files"
echo "  - Streams: camera1, camera2, living-room"
