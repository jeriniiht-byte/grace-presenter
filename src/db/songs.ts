import type { Song, SongTranslation, SongSection } from '../types/db';
import { getDatabase } from './client';

interface SongRow {
  id: number;
  slug: string;
  defaultCcli: string | null;
  structure: string;
}

function parseSong(row: SongRow): Song {
  return {
    id: row.id,
    slug: row.slug,
    defaultCcli: row.defaultCcli ?? undefined,
    structure: JSON.parse(row.structure)
  };
}

export async function listSongs(): Promise<Song[]> {
  const db = await getDatabase();
  const rows = await db.select<SongRow[]>(
    `SELECT id, slug, default_ccli AS defaultCcli, structure FROM songs ORDER BY id`
  );
  return rows.map(parseSong);
}

export async function getSong(id: number): Promise<Song | null> {
  const db = await getDatabase();
  const rows = await db.select<SongRow[]>(
    `SELECT id, slug, default_ccli AS defaultCcli, structure FROM songs WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? parseSong(rows[0]) : null;
}

export async function getSongTranslation(
  songId: number,
  languageCode: string
): Promise<SongTranslation | null> {
  const db = await getDatabase();
  const rows = await db.select<SongTranslation[]>(
    `SELECT id, song_id AS songId, language_code AS languageCode, title, transliteration
     FROM song_translations WHERE song_id = $1 AND language_code = $2`,
    [songId, languageCode]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getSongSections(
  songTranslationId: number
): Promise<SongSection[]> {
  const db = await getDatabase();
  return db.select<SongSection[]>(
    `SELECT id, song_translation_id AS songTranslationId, section_key AS sectionKey, text, transliteration
     FROM song_sections WHERE song_translation_id = $1`,
    [songTranslationId]
  );
}

export async function searchSongs(query: string): Promise<Song[]> {
  const db = await getDatabase();
  const rows = await db.select<SongRow[]>(
    `SELECT DISTINCT s.id, s.slug, s.default_ccli AS defaultCcli, s.structure
     FROM song_sections_fts f
     JOIN song_sections sec ON sec.id = f.rowid
     JOIN song_translations st ON st.id = sec.song_translation_id
     JOIN songs s ON s.id = st.song_id
     WHERE f.text MATCH $1
     LIMIT 100`,
    [query]
  );
  return rows.map(parseSong);
}

export async function searchSongsByLanguage(
  query: string,
  languageCode: string
): Promise<SongTranslation[]> {
  const db = await getDatabase();
  return db.select<SongTranslation[]>(
    `SELECT DISTINCT st.id, st.song_id AS songId, st.language_code AS languageCode, st.title, st.transliteration
     FROM song_sections_fts f
     JOIN song_sections sec ON sec.id = f.rowid
     JOIN song_translations st ON st.id = sec.song_translation_id
     WHERE f.text MATCH $1 AND st.language_code = $2
     LIMIT 100`,
    [query, languageCode]
  );
}

/** Matches by title, including the romanized ("Manglish"/"Tanglish") title. */
export async function searchSongTitles(
  query: string,
  languageCode: string
): Promise<SongTranslation[]> {
  const db = await getDatabase();
  return db.select<SongTranslation[]>(
    `SELECT id, song_id AS songId, language_code AS languageCode, title, transliteration
     FROM song_translations
     WHERE language_code = $1 AND (title LIKE $2 OR transliteration LIKE $2)
     ORDER BY title
     LIMIT 100`,
    [languageCode, `%${query}%`]
  );
}

export async function getTranslationsForSong(songId: number): Promise<SongTranslation[]> {
  const db = await getDatabase();
  return db.select<SongTranslation[]>(
    `SELECT id, song_id AS songId, language_code AS languageCode, title, transliteration
     FROM song_translations WHERE song_id = $1
     ORDER BY language_code`,
    [songId]
  );
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'song';
}

export interface NewSongSection {
  key: string;
  text: string;
  transliteration?: string;
}

export interface NewSongInput {
  title: string;
  transliteration?: string;
  languageCode: string;
  structure: string[];
  sections: NewSongSection[];
}

export async function createSongWithTranslation(input: NewSongInput): Promise<Song> {
  const db = await getDatabase();

  const baseSlug = slugify(input.title);
  let slug = baseSlug;
  let suffix = 1;
  while ((await db.select<{ id: number }[]>(`SELECT id FROM songs WHERE slug = $1`, [slug])).length > 0) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const songResult = await db.execute(
    `INSERT INTO songs (slug, default_ccli, structure) VALUES ($1, NULL, $2)`,
    [slug, JSON.stringify(input.structure)]
  );
  const songId = songResult.lastInsertId!;

  const translationResult = await db.execute(
    `INSERT INTO song_translations (song_id, language_code, title, transliteration) VALUES ($1, $2, $3, $4)`,
    [songId, input.languageCode, input.title, input.transliteration ?? null]
  );
  const translationId = translationResult.lastInsertId!;

  for (const section of input.sections) {
    await db.execute(
      `INSERT INTO song_sections (song_translation_id, section_key, text, transliteration) VALUES ($1, $2, $3, $4)`,
      [translationId, section.key, section.text, section.transliteration ?? null]
    );
  }

  const rows = await db.select<SongRow[]>(
    `SELECT id, slug, default_ccli AS defaultCcli, structure FROM songs WHERE id = $1`,
    [songId]
  );
  return parseSong(rows[0]);
}

export async function getSongsByLanguage(languageCode: string): Promise<SongTranslation[]> {
  const db = await getDatabase();
  return db.select<SongTranslation[]>(
    `SELECT id, song_id AS songId, language_code AS languageCode, title, transliteration
     FROM song_translations WHERE language_code = $1
     ORDER BY title
     LIMIT 200`,
    [languageCode]
  );
}
