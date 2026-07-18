import { getDb } from '@/database/client';
import type { Student } from '@/types/models';

export async function createStudent(
  fullName: string,
  rollNumber: string,
  classId: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Students (fullName, rollNumber, classId, createdAt) VALUES (?, ?, ?, ?)',
    fullName,
    rollNumber,
    classId,
    new Date().toISOString(),
  );
}

export async function getStudentsByClass(classId: number): Promise<Student[]> {
  const db = await getDb();
  return db.getAllAsync<Student>(
    'SELECT * FROM Students WHERE classId = ? ORDER BY rollNumber ASC',
    classId,
  );
}
