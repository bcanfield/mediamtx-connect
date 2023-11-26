export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // const { readdir, stat } = await import("fs/promises");
    const cron = await import("node-cron");
    const cp = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");
    // const { default: ffmpeg } = await import("fluent-ffmpeg");
    // process.env.FLUENTFFMPEG_COV = "false";

    const screenshotsDirectory =
      process.env.MEDIAMTX_SCREENSHOTS_DIR || "/screenshots";

    if (!fs.existsSync(screenshotsDirectory)) {
      fs.mkdirSync(screenshotsDirectory);
      console.log("Screenshots Directory created successfully.");
    } else {
      console.log("Screenshots Directory already exists.");
    }

    const recordingsDirectory = process.env.MEDIAMTX_RECORDINGS_DIR;

    if (!recordingsDirectory) {
      console.error("NO RECORDING DIRECTORY CONFIGURED");
      return;
    }
    if (!fs.existsSync(recordingsDirectory)) {
      fs.mkdirSync(recordingsDirectory);
      console.log("Recordings Directory created successfully.");
    } else {
      console.log("Reocrdings Directory already exists.");
    }

    const getFileNamesWithoutExtension = (directoryPath: string) => {
      try {
        const files = fs.readdirSync(directoryPath);
        return files.map((file) => path.parse(file).name);
      } catch (err) {
        throw new Error(`Error reading directory: ${err}`);
      }
    };

    const getSubdirectories = (dirPath: string) => {
      try {
        const files = fs.readdirSync(dirPath);
        const subdirectories = files.filter((file) => {
          const filePath = path.join(dirPath, file);
          return fs.statSync(filePath).isDirectory() && !file.startsWith(".");
        });
        return subdirectories;
        // return subdirectories.map((subdir) => path.join(dirPath, subdir));
      } catch (err) {
        throw new Error(`Error reading directory: ${err}`);
      }
    };

    const generateScreenshots = () => {
      console.log("Scanning new recordings to generate new screenshots");

      const streamRecordingDirectories = getSubdirectories(recordingsDirectory);

      streamRecordingDirectories.forEach((subdirectory) => {
        const filesInSubdir = getFileNamesWithoutExtension(
          path.join(recordingsDirectory, subdirectory),
        );
        const filesInOtherDirectory = getFileNamesWithoutExtension(
          path.join(screenshotsDirectory, subdirectory),
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
            screenshotsDirectory,
            subdirectory,
            `${recording}.png`,
          );
          // console.log({ inputFile, outputFile });
          const args = [
            "-ss",
            "00:00:00",
            "-i",
            inputFile,
            // "-s",
            // "320x240",
            "-frames:v",
            "1",
            outputFile,
          ];
          const proc = cp.spawn(cmd, args);

          proc.stdout.on("data", function (data) {
            // console.log(data);
          });

          proc.stderr.setEncoding("utf8");
          proc.stderr.on("data", function (data) {
            // console.log(data);
          });

          proc.on("close", function () {
            console.log(`Finished Generating screenshot ${outputFile}`);
          });
        });
      });
    };

    generateScreenshots();
    cron.schedule("*/30 * * * *", async function () {
      generateScreenshots();
    });
  } else {
    console.log("INVALID NEXT RUNTIME. BACKGROUND TASKS WILL NOT WORK");
  }
}
