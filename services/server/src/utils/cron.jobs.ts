import cron from "node-cron";
import Attendance from "../models/attendance/attendance.model";

// in 12Am delete all attendance records db
cron.schedule("0 0 * * *", async () => {
      await Attendance.deleteMany({})
  });