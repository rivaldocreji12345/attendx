import { getDb } from '@/database/client';

export async function initializeDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
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
  `);
}
