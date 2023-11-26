export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    cron.schedule("*/2 * * * * *", function () {
      console.log("Generating New Screenshots");
    });
  } else {
    console.log("INVALID NEXT RUNTIME. BACKGROUND TASKS WILL NOT WORK");
  }
}
