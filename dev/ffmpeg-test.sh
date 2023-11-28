#!/bin/bash

# Check if the STREAM_COUNT variable is provided
if [ -z "$STREAM_COUNT" ]; then
    echo "Please provide the number of streams to create."
    exit 1
fi

# Run ffmpeg command multiple times based on STREAM_COUNT in the background
for ((i = 1; i <= STREAM_COUNT; i++)); do
    ffmpeg -re -stream_loop -1 -i dev/test.mp4 -f rtsp -rtsp_transport tcp "rtsp://localhost:8554/test-stream$i" &
done

# Wait for all background processes to complete
wait