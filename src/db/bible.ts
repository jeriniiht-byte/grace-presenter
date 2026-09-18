import type { BibleVerse, BibleBook, BibleBookName, BibleTranslation } from '../types/db';
import { getDatabase } from './client';

export async function listBooks(): Promise<BibleBook[]> {
  const db = await getDatabase();
  return db.select<BibleBook[]>(
    `SELECT id, book_number AS bookNumber, testament FROM bible_books ORDER BY book_number`
  );
}

export async function getBookNames(
  translationId: number
): Promise<BibleBookName[]> {
  const db = await getDatabase();
  return db.select<BibleBookName[]>(
    `SELECT book_id AS bookId, translation_id AS translationId, name, abbrev
     FROM bible_book_names WHERE translation_id = $1
     ORDER BY book_id`,
    [translationId]
  );
}

export async function getChapter(
  translationId: number,
  bookId: number,
  chapter: number
): Promise<BibleVerse[]> {
  const db = await getDatabase();
  return db.select<BibleVerse[]>(
    `SELECT id, translation_id AS translationId, book_id AS bookId, chapter, verse, text
     FROM bible_verses
     WHERE translation_id = $1 AND book_id = $2 AND chapter = $3
     ORDER BY verse`,
    [translationId, bookId, chapter]
  );
}

export async function getVerseRange(
  translationId: number,
  bookId: number,
  chapter: number,
  verseStart: number,
  verseEnd: number
): Promise<BibleVerse[]> {
  const db = await getDatabase();
  return db.select<BibleVerse[]>(
    `SELECT id, translation_id AS translationId, book_id AS bookId, chapter, verse, text
     FROM bible_verses
     WHERE translation_id = $1 AND book_id = $2 AND chapter = $3
       AND verse >= $4 AND verse <= $5
     ORDER BY verse`,
    [translationId, bookId, chapter, verseStart, verseEnd]
  );
}

export async function searchVerses(
  translationId: number,
  query: string
): Promise<BibleVerse[]> {
  const db = await getDatabase();
  return db.select<BibleVerse[]>(
    `SELECT v.id, v.translation_id AS translationId, v.book_id AS bookId, v.chapter, v.verse, v.text
     FROM bible_verses_fts f
     JOIN bible_verses v ON v.id = f.rowid
     WHERE f.text MATCH $1 AND v.translation_id = $2
     ORDER BY v.book_id, v.chapter, v.verse
     LIMIT 100`,
    [query, translationId]
  );
}

export async function getTranslations(): Promise<BibleTranslation[]> {
  const db = await getDatabase();
  return db.select<BibleTranslation[]>(
    `SELECT id, language_code AS languageCode, code, name FROM bible_translations ORDER BY id`
  );
}

export async function getTranslationById(id: number): Promise<BibleTranslation | null> {
  const db = await getDatabase();
  const rows = await db.select<BibleTranslation[]>(
    `SELECT id, language_code AS languageCode, code, name FROM bible_translations WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getBookName(translationId: number, bookId: number): Promise<string> {
  const db = await getDatabase();
  const rows = await db.select<{ name: string }[]>(
    `SELECT name FROM bible_book_names WHERE translation_id = $1 AND book_id = $2`,
    [translationId, bookId]
  );
  if (rows.length > 0) return rows[0].name;
  const bookRows = await db.select<{ bookNumber: number }[]>(
    `SELECT book_number AS bookNumber FROM bible_books WHERE id = $1`,
    [bookId]
  );
  return bookRows.length > 0 ? `Book ${bookRows[0].bookNumber}` : `Book ${bookId}`;
}
