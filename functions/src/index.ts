import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

import { getActiveUsers } from "../../backend/dist/services/firestoreService";
import { runDailyPipelineForUser } from "../../jobs/runDailyPipelineJob.ts";

export const runDailyAutomation = onSchedule(
  {
    schedule: "every day 06:00",
    timeZone: "America/Phoenix",
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 1800,
  },
  async () => {
    logger.info("Daily automation started");

    const users = await getActiveUsers();
    logger.info(`Active users found: ${users.length}`);

    for (const user of users) {
      try {
        logger.info(`Processing user ${user.userId}`);
        await runDailyPipelineForUser(user);
        logger.info(`Finished user ${user.userId}`);
      } catch (error) {
        logger.error(`Failed user ${user.userId}`, error);
      }
    }

    logger.info("Daily automation finished");
  }
);

export const testDailyAutomation = onRequest(async (_req, res) => {
  try {
    const users = await getActiveUsers();

    for (const user of users) {
      await runDailyPipelineForUser(user);
    }

    res.json({
      success: true,
      processedUsers: users.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});