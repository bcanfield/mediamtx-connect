FROM alpine:3.19.0@sha256:51b67269f354137895d43f3b3d810bfacd3945438e94dc5ac55fdac340352f48

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Set the working directory in the container
WORKDIR /app

# Copy the shell script from the local directory to the container's /app directory
COPY ffmpeg-test.sh /app/
COPY test.mp4 /app/

# Set execute permissions for the shell script (if needed)
RUN chmod +x /app/ffmpeg-test.sh

# Define the command to run when the container starts
CMD ["sh", "/app/ffmpeg-test.sh"]
