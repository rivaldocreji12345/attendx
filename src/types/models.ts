export type Student = {
  id: number;
  fullName: string;
  rollNumber: string;
  classId: number;
  createdAt: string;
};

export type ClassRoom = {
  id: number;
  title: string;
  section: string;
  createdAt: string;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
};
