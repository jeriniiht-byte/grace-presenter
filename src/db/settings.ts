import { getDatabase } from './client';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const rows = await db.select<{ value: string }[]>(
    `SELECT value FROM settings WHERE key = $1`,
    [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function getSettings(): Promise<Record<string, string>> {
  const db = await getDatabase();
  const rows = await db.select<{ key: string; value: string }[]>(
    `SELECT key, value FROM settings`
  );
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}
