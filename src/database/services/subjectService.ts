import { getDb } from '@/database/client';
import type { Subject } from '@/types/models';

export async function getSubjects(): Promise<Subject[]> {
  const db = await getDb();
  return db.getAllAsync<Subject>('SELECT * FROM Subjects ORDER BY createdAt ASC');
}

export async function createSubject(name: string, totalHours = 50): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Subjects (name, totalHours, createdAt) VALUES (?, ?, ?)',
    name,
    totalHours,
    new Date().toISOString(),
  );
}

export async function deleteSubject(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Subjects WHERE id = ?', id);
}

export async function replaceAllSubjects(names: string[], totalHours = 50): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Subjects');
  const now = new Date().toISOString();
  for (const name of names) {
    await db.runAsync(
      'INSERT INTO Subjects (name, totalHours, createdAt) VALUES (?, ?, ?)',
      name,
      totalHours,
      now,
    );
  }
}
