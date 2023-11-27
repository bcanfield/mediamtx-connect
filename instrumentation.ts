export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const cp = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");

    const screenshotsDirectory = "/screenshots";

    if (!screenshotsDirectory) {
      console.error("NO SCREENSHOT DIRECTORY CONFIGURED");
      return;
    }
    // if (!fs.existsSync(screenshotsDirectory)) {
    //   fs.mkdirSync(screenshotsDirectory);
    //   console.log("Screenshots Directory created successfully.");
    // } else {
    //   console.log("Screenshots Directory already exists.");
    // }

    const recordingsDirectory = "/recordings";

    if (!recordingsDirectory) {
      console.error("NO RECORDING DIRECTORY CONFIGURED");
      return;
    }
    // if (!fs.existsSync(recordingsDirectory)) {
    //   fs.mkdirSync(recordingsDirectory);
    //   console.log("Recordings Directory created successfully.");
    // } else {
    //   console.log("Reocrdings Directory already exists.");
    // }

    // Deletes screenshots older than 2 days
    const cleanupScreenshots = () => {
      console.log("Cleaning up sccreenshots");
      try {
        const streamRecordingDirectories =
          getSubdirectories(screenshotsDirectory);

        streamRecordingDirectories.forEach((subdirectory) => {
          const streamRecordingDirectory = path.join(
            screenshotsDirectory,
            subdirectory,
          );
          const files = fs
            .readdirSync(streamRecordingDirectory)
            .filter((f) => !f.startsWith("."));
          const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000; // Calculate the timestamp for 2 days ago

          files.forEach((file) => {
            const filePath = path.join(streamRecordingDirectory, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile() && fileStat.mtimeMs < twoDaysAgo) {
              fs.unlinkSync(filePath); // Delete the file if it's older than 2 days
              console.log(`Deleted screenshot: ${filePath}`);
            }
          });
        });
      } catch (err) {
        throw new Error(`Error deleting files: ${err}`);
      }
    };

    const getFileNamesWithoutExtension = (directoryPath: string) => {
      try {
        const files = fs
          .readdirSync(directoryPath)
          .filter((f) => !f.startsWith("."));
        return files.map((file) => path.parse(file).name);
      } catch (err) {
        throw new Error(`Error reading directory: ${err}`);
      }
    };

    const getSubdirectories = (dirPath: string) => {
      try {
        const files = fs.readdirSync(dirPath).filter((f) => !f.startsWith("."));
        const subdirectories = files.filter((file) => {
          const filePath = path.join(dirPath, file);
          return fs.statSync(filePath).isDirectory();
        });
        return subdirectories;
      } catch (err) {
        throw new Error(`Error reading directory: ${err}`);
      }
    };

    const generateScreenshots = () => {
      console.log("Scanning new recordings to generate new screenshots");
      const streamRecordingDirectories = getSubdirectories(recordingsDirectory);

      streamRecordingDirectories.forEach((subdirectory) => {
        const streamScreenshotDirectory = path.join(
          screenshotsDirectory,
          subdirectory,
        );
        if (!fs.existsSync(streamScreenshotDirectory)) {
          fs.mkdirSync(streamScreenshotDirectory);
          console.log("Screenshots Directory created successfully.");
        }
        const filesInSubdir = getFileNamesWithoutExtension(
          path.join(recordingsDirectory, subdirectory),
        );
        const filesInOtherDirectory = getFileNamesWithoutExtension(
          path.join(streamScreenshotDirectory),
        );

        const recordingsWithoutScreenshots = filesInSubdir.filter(
          (file) => !filesInOtherDirectory.includes(file),
        );

        console.log(
          `${recordingsWithoutScreenshots.length} Recordings without screenshots in: ${subdirectory}:`,
        );
        // For each recording without a screenshot, generate it and put it in the screenshots directory
        recordingsWithoutScreenshots.forEach((recording) => {
          const cmd = "ffmpeg";
          const inputFile = path.join(
            recordingsDirectory,
            subdirectory,
            `${recording}.mp4`,
          );
          const outputFile = path.join(
            streamScreenshotDirectory,
            `${recording}.png`,
          );
          const args = [
            "-ss",
            "00:00:00",
            "-i",
            inputFile,
            "-frames:v",
            "1",
            outputFile,
          ];
          const proc = cp.spawn(cmd, args);
          proc.stderr.setEncoding("utf8");

          proc.on("close", function () {
            console.log(`Finished Generating screenshot ${outputFile}`);
          });
        });
      });
    };

    generateScreenshots();
    cleanupScreenshots();

    // Run every 30 mins
    cron.schedule("*/30 * * * *", async function () {
      generateScreenshots();
    });

    // Run every day at midnight
    cron.schedule("0 0 0 * * *", async function () {
      cleanupScreenshots();
    });
  } else {
    console.log("INVALID NEXT RUNTIME. BACKGROUND TASKS WILL NOT WORK");
  }
}
