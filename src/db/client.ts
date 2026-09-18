import Database from '@tauri-apps/plugin-sql';

let dbPromise: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:grace.db');
  }
  return dbPromise;
}

export async function closeDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.close();
    dbPromise = null;
  }
}
