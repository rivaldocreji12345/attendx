import { getDb } from '@/database/client';
import type { AttendanceRecord, AttendanceStatus } from '@/types/models';

export async function upsertAttendanceRecord(
  studentId: number,
  classId: number,
  date: string,
  status: AttendanceStatus,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO AttendanceRecords (studentId, classId, date, status, markedAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(studentId, date)
      DO UPDATE SET status = excluded.status, markedAt = excluded.markedAt`,
    studentId,
    classId,
    date,
    status,
    new Date().toISOString(),
  );
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const db = await getDb();
  return db.getAllAsync<AttendanceRecord>(
    'SELECT * FROM AttendanceRecords WHERE date = ? ORDER BY markedAt DESC',
    date,
  );
}
