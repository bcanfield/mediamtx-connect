#!/bin/bash

# Check if the STREAM_COUNT variable is provided
if [ -z "$1" ]; then
    echo "Please provide the number of streams to create."
    exit 1
fi

# Run ffmpeg command multiple times based on STREAM_COUNT in the background
for ((i = 1; i <= $1; i++)); do
    ffmpeg -re -stream_loop -1 -i dev/test.mp4 -c:v libx264 -preset ultrafast -tune zerolatency -c:a aac -strict -2 -f rtsp -rtsp_transport tcp "rtsp://localhost:8554/test-stream$i" &
done

# Wait for all background processes to complete
wait