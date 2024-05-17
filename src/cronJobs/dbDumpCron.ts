import { CronJob } from "cron";
import { dumpDB } from "../services/storage/jackal";

export const backupDBStateCron = new CronJob(`0 0/15 0/7 * *`, async () => {
  console.log("Running db backup");
  await dumpDB();
});
