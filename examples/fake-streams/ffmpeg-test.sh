#!/bin/bash

# Wait for MediaMTX to be ready
echo "Waiting for MediaMTX to start..."
sleep 5

# Run ffmpeg command multiple times based on STREAM_COUNT in the background
count=0
for i in 1 2 3 4 5
do
    ffmpeg -re -stream_loop -1 -i test.mp4 -c:v libx264 -preset ultrafast -tune zerolatency -c:a aac -strict -2 -f rtsp -rtsp_transport tcp "rtsp://mediamtx:8554/stream$i" &
done

# Wait for all background processes to complete
wait