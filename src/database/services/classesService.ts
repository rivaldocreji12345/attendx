import { getDb } from '@/database/client';
import type { ClassRoom } from '@/types/models';

export async function createClass(title: string, section: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Classes (title, section, createdAt) VALUES (?, ?, ?)',
    title,
    section,
    new Date().toISOString(),
  );
}

export async function getClasses(): Promise<ClassRoom[]> {
  const db = await getDb();
  return db.getAllAsync<ClassRoom>('SELECT * FROM Classes ORDER BY createdAt DESC');
}
