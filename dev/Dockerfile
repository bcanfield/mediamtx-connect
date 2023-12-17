FROM alpine:3.19.0@sha256:13b7e62e8df80264dbb747995705a986aa530415763a6c58f84a3ca8af9a5bcd

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
