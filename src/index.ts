import { connectToSnowflake } from "./clients/snowflakeClient";
import AppFolioReports from "./const/appfolio";
import { SnowFlakeInsertingMethod } from "./const/enum";
import { handleAppFolioData } from "./services/appfolioService";
import logger from "./utils/logger"; // Import Winston logger

type AppFolioReportKey = keyof typeof AppFolioReports;

/**
 * Process a single report with retry logic
 */
async function processReport(reportKey: AppFolioReportKey, retries = 3) {
  const report = AppFolioReports[reportKey];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(
        `[INFO] Attempting to process report: ${reportKey} (Attempt ${attempt}/${retries})`
      );

      const endpoint = report.name;
      const tableName = `appfolio_${report.name}`;
      const params = report.params;
      const paginated = true; // Fetch paginated results
      const insertMethod = SnowFlakeInsertingMethod.BulkInsert;
      const batchSize = 50000; // Batch size for batch inserts

      logger.info(`[INFO] Configured endpoint: ${endpoint}`);
      logger.info(`[INFO] Target table: ${tableName}`);
      logger.info(`[INFO] Insert method: ${insertMethod}`);
      logger.info(`[INFO] Batch size: ${batchSize}`);
      logger.info(`[INFO] Paginated fetch: ${paginated}`);

      // Handle AppFolio data
      logger.info("[INFO] Fetching and inserting AppFolio data...");
      await handleAppFolioData(
        endpoint,
        tableName,
        paginated,
        insertMethod,
        batchSize,
        params
      );

      logger.info(`[INFO] Report ${reportKey} completed successfully.`);
      return; // Exit the retry loop on success
    } catch (err: any) {
      logger.error(
        `[ERROR] Failed to process report ${reportKey} on attempt ${attempt}: ${err.message}`,
        {
          stack: err.stack,
        }
      );

      if (attempt === retries) {
        logger.error(
          `[ERROR] Max retries reached for report ${reportKey}. Skipping...`
        );
        throw err; // Re-throw the error after max retries
      }

      logger.warn(
        `[WARN] Retrying report ${reportKey} (Attempt ${
          attempt + 1
        }/${retries})...`
      );
    }
  }
}

/**
 * Process all reports sequentially
 */
async function processAllReports() {
  logger.info("[INFO] Starting the AppFolio data pipeline...");

  // Connect to Snowflake
  logger.info("[INFO] Connecting to Snowflake...");
  await connectToSnowflake();
  logger.info("[INFO] Successfully connected to Snowflake.");

  // Process each report in sequence
  const reportKeys = Object.keys(AppFolioReports) as Array<AppFolioReportKey>;

  for (let i = 0; i < reportKeys.length; i++) {
    const reportKey = reportKeys[i];
    logger.info(
      `[INFO] Starting report ${i + 1}/${reportKeys.length}: ${reportKey}`
    );

    try {
      await processReport(reportKey); // Process each report with retry logic
    } catch (err) {
      logger.error(
        `[CRITICAL] Failed to process report ${reportKey}. Moving to the next report.`
      );
    }
  }

  logger.info("[INFO] All reports processed successfully.");
}

/**
 * Main function to run the pipeline at intervals
 */
async function main() {
  const interval = 60 * 60 * 1000; // Interval in milliseconds (e.g., 1 hour)

  try {
    while (true) {
      logger.info("[INFO] Starting a new pipeline iteration...");
      await processAllReports(); // Process all reports sequentially
      logger.info(
        `[INFO] Pipeline iteration completed. Waiting ${
          interval / 1000
        } seconds before next run...`
      );

      // Wait for the specified interval before the next iteration
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  } catch (err) {
    logger.error("[CRITICAL] Unhandled exception in the pipeline.", {
      error: err,
    });
    throw err; // Re-throw the error to allow external monitoring systems to capture it
  }
}

// Start the pipeline
main().catch((err) => {
  logger.error("[CRITICAL] Unhandled exception in main pipeline.", {
    error: err,
  });
});
