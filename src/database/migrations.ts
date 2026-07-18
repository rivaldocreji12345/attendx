import { getDb } from '@/database/client';

export async function initializeDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Legacy tables (kept for backward compatibility)
    CREATE TABLE IF NOT EXISTS Classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      section TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      rollNumber TEXT NOT NULL,
      classId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(classId) REFERENCES Classes(id)
    );

    CREATE TABLE IF NOT EXISTS AttendanceRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      classId INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
      markedAt TEXT NOT NULL,
      FOREIGN KEY(studentId) REFERENCES Students(id),
      FOREIGN KEY(classId) REFERENCES Classes(id),
      UNIQUE(studentId, date)
    );

    -- Student profile (single row per device)
    CREATE TABLE IF NOT EXISTS Profile (
      id INTEGER PRIMARY KEY,
      studentName TEXT NOT NULL,
      rollNumber TEXT NOT NULL,
      courseName TEXT NOT NULL,
      semester INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );

    -- Subjects for current semester
    CREATE TABLE IF NOT EXISTS Subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      totalHours INTEGER NOT NULL DEFAULT 50,
      createdAt TEXT NOT NULL
    );

    -- Per-subject daily attendance
    CREATE TABLE IF NOT EXISTS SubjectAttendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subjectId INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
      markedAt TEXT NOT NULL,
      FOREIGN KEY(subjectId) REFERENCES Subjects(id),
      UNIQUE(subjectId, date)
    );

    -- Leave applications
    CREATE TABLE IF NOT EXISTS Leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subjectId INTEGER,
      leaveType TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      documentName TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(subjectId) REFERENCES Subjects(id)
    );
  `);
}
