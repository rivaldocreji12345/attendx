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
  periods: number = 1,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO SubjectAttendance (subjectId, date, status, periods, markedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(subjectId, date)
     DO UPDATE SET status = excluded.status, periods = excluded.periods, markedAt = excluded.markedAt`,
    subjectId,
    date,
    status,
    periods,
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

/** Returns each subject with attended periods count, absent periods count, total periods count, and attendance percentage. */
export async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  const db = await getDb();
  return db.getAllAsync<SubjectWithStats>(`
    SELECT
      s.id,
      s.name,
      s.totalHours,
      s.createdAt,
      IFNULL(SUM(CASE WHEN sa.status = 'present' THEN sa.periods ELSE 0 END), 0) AS attendedPeriods,
      IFNULL(SUM(CASE WHEN sa.status = 'absent' THEN sa.periods ELSE 0 END), 0) AS absentPeriods,
      IFNULL(SUM(sa.periods), 0) AS totalPeriods,
      CASE
        WHEN SUM(sa.periods) IS NULL THEN 0
        ELSE ROUND(
          CAST(SUM(CASE WHEN sa.status = 'present' THEN sa.periods ELSE 0 END) AS REAL)
          / SUM(sa.periods) * 100,
          1
        )
      END AS attendancePercent
    FROM Subjects s
    LEFT JOIN SubjectAttendance sa ON sa.subjectId = s.id
    GROUP BY s.id
    ORDER BY s.createdAt ASC
  `);
}

