FROM alpine:3.19.0@sha256:51b67269f354137895d43f3b3d810bfacd3945438e94dc5ac55fdac340352f48

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Set the working directory in the container
WORKDIR /app

# Streams are generated from ffmpeg lavfi sources, so no video file is needed.
COPY ffmpeg-test.sh /app/

# Set execute permissions for the shell script (if needed)
RUN chmod +x /app/ffmpeg-test.sh

# Define the command to run when the container starts
CMD ["sh", "/app/ffmpeg-test.sh"]
