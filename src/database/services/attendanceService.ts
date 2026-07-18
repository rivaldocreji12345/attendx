import { getDb } from '@/database/client';
import type { AttendanceRecord, AttendanceStatus, SubjectAttendance, SubjectWithStats } from '@/types/models';

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

// ── Subject-based attendance ──────────────────────────────────────────────

export async function upsertSubjectAttendance(
  subjectId: number,
  date: string,
  status: AttendanceStatus,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO SubjectAttendance (subjectId, date, status, markedAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(subjectId, date)
     DO UPDATE SET status = excluded.status, markedAt = excluded.markedAt`,
    subjectId,
    date,
    status,
    new Date().toISOString(),
  );
}

export async function getSubjectAttendanceByDate(date: string): Promise<SubjectAttendance[]> {
  const db = await getDb();
  return db.getAllAsync<SubjectAttendance>(
    'SELECT * FROM SubjectAttendance WHERE date = ? ORDER BY markedAt DESC',
    date,
  );
}

export async function getSubjectAttendanceRecord(
  subjectId: number,
  date: string,
): Promise<SubjectAttendance | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SubjectAttendance>(
    'SELECT * FROM SubjectAttendance WHERE subjectId = ? AND date = ?',
    subjectId,
    date,
  );
  return row ?? null;
}

/** Returns each subject with attended hours count and attendance percentage. */
export async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  const db = await getDb();
  return db.getAllAsync<SubjectWithStats>(`
    SELECT
      s.id,
      s.name,
      s.totalHours,
      s.createdAt,
      COUNT(CASE WHEN sa.status = 'present' THEN 1 END) AS attendedHours,
      CASE
        WHEN s.totalHours = 0 THEN 0
        ELSE ROUND(
          CAST(COUNT(CASE WHEN sa.status = 'present' THEN 1 END) AS REAL)
          / s.totalHours * 100,
          1
        )
      END AS attendancePercent
    FROM Subjects s
    LEFT JOIN SubjectAttendance sa ON sa.subjectId = s.id
    GROUP BY s.id
    ORDER BY s.createdAt ASC
  `);
}

