export type AttendanceRecord = {
  userId: string;
  name: string;

  // store multiple joins and leaves
  joinTimes: number[];
  leaveTimes: number[];

  // total time inside meeting (in milliseconds)
  totalDuration: number;
};

export type AttendanceMap = Record<string, AttendanceRecord>;