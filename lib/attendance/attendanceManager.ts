import { AttendanceMap } from "./attendance.types";

export class AttendanceManager {
  private attendance: AttendanceMap = {};

  // When user joins
  handleJoin(userId: string, name: string) {
    const existing = this.attendance[userId];

    if (!existing) {
      this.attendance[userId] = {
        userId,
        name,
        joinTimes: [Date.now()],
        leaveTimes: [],
        totalDuration: 0,
      };
    } else {
      existing.joinTimes.push(Date.now());
    }
  }

  // When user leaves
  handleLeave(userId: string) {
    const record = this.attendance[userId];
    if (!record) return;

    const lastJoinTime =
      record.joinTimes[record.joinTimes.length - 1];

    if (!lastJoinTime) return;

    const leaveTime = Date.now();
    record.leaveTimes.push(leaveTime);

    const duration = leaveTime - lastJoinTime;
    record.totalDuration += duration;
  }

  // When meeting ends (to close open sessions)
  finalizeAttendance() {
    const now = Date.now();

    Object.values(this.attendance).forEach((record) => {
      if (record.joinTimes.length > record.leaveTimes.length) {
        const lastJoinTime =
          record.joinTimes[record.joinTimes.length - 1];

        const duration = now - lastJoinTime;
        record.totalDuration += duration;

        record.leaveTimes.push(now);
      }
    });

    return this.attendance;
  }

  // Get current attendance state
  getAttendance() {
    return this.attendance;
  }
}