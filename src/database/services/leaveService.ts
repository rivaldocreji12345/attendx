import { getDb } from '@/database/client';
import type { Leave, LeaveStatus, LeaveType } from '@/types/models';

export async function getLeaves(subjectId?: number): Promise<Leave[]> {
  const db = await getDb();
  if (subjectId !== undefined) {
    return db.getAllAsync<Leave>(
      'SELECT * FROM Leaves WHERE subjectId = ? ORDER BY createdAt DESC',
      subjectId,
    );
  }
  return db.getAllAsync<Leave>('SELECT * FROM Leaves ORDER BY createdAt DESC');
}

export async function createLeave(
  subjectId: number | null,
  leaveType: LeaveType,
  startDate: string,
  endDate: string,
  reason: string,
  documentName: string | null,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO Leaves (subjectId, leaveType, startDate, endDate, reason, status, documentName, createdAt)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    subjectId,
    leaveType,
    startDate,
    endDate,
    reason,
    documentName,
    new Date().toISOString(),
  );
}

export async function updateLeaveStatus(id: number, status: LeaveStatus): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE Leaves SET status = ? WHERE id = ?', status, id);
}

export async function countLeavesByStatus(status: LeaveStatus): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM Leaves WHERE status = ?',
    status,
  );
  return row?.count ?? 0;
}

export async function countAllLeaves(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM Leaves');
  return row?.count ?? 0;
}
