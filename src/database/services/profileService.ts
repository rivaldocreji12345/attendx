import { getDb } from '@/database/client';
import type { Profile } from '@/types/models';

export async function getProfile(): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Profile>('SELECT * FROM Profile WHERE id = 1');
  return row ?? null;
}

export async function saveProfile(
  studentName: string,
  rollNumber: string,
  courseName: string,
  semester: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO Profile (id, studentName, rollNumber, courseName, semester, createdAt)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       studentName = excluded.studentName,
       rollNumber  = excluded.rollNumber,
       courseName  = excluded.courseName,
       semester    = excluded.semester`,
    studentName,
    rollNumber,
    courseName,
    semester,
    new Date().toISOString(),
  );
}
