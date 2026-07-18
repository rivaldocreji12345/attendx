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

// ── New types added for the full app ──────────────────────────────────────

/** Single student profile stored on-device (one per install). */
export type Profile = {
  id: number;
  studentName: string;
  rollNumber: string;
  courseName: string;
  semester: number;
  createdAt: string;
};

/** A subject the student attends this semester. */
export type Subject = {
  id: number;
  name: string;
  totalHours: number;
  createdAt: string;
};

/** Per-subject daily attendance entry. */
export type SubjectAttendance = {
  id: number;
  subjectId: number;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
};

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'medical' | 'personal' | 'academic' | 'emergency';

/** A leave application submitted by the student. */
export type Leave = {
  id: number;
  subjectId: number | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  documentName: string | null;
  createdAt: string;
};

/** Subject enriched with computed attendance stats. */
export type SubjectWithStats = Subject & {
  attendedSessions: number;
  absentSessions: number;
  totalSessions: number;
  attendancePercent: number;
};
