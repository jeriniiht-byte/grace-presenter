import type { Service, CustomSlide } from '../types/db';
import type { ServiceItem, ServiceItemPayload } from '../types/slide';
import { getDatabase } from './client';

interface ServiceItemRow {
  id: number;
  position: number;
  itemType: 'bible' | 'song' | 'custom';
  label: string;
  bibleTranslationIds: string | null;
  bibleBookId: number | null;
  bibleChapter: number | null;
  bibleVerseStart: number | null;
  bibleVerseEnd: number | null;
  songId: number | null;
  songLanguageCode: string | null;
  customSlideId: number | null;
}

function parseServiceItem(row: ServiceItemRow): ServiceItem {
  return {
    id: String(row.id),
    position: row.position,
    itemType: row.itemType,
    label: row.label,
    bibleTranslationIds: row.bibleTranslationIds ? JSON.parse(row.bibleTranslationIds) : undefined,
    bibleBookId: row.bibleBookId ?? undefined,
    bibleChapter: row.bibleChapter ?? undefined,
    bibleVerseStart: row.bibleVerseStart ?? undefined,
    bibleVerseEnd: row.bibleVerseEnd ?? undefined,
    songId: row.songId ?? undefined,
    songLanguageCode: row.songLanguageCode ?? undefined,
    customSlideId: row.customSlideId ?? undefined
  };
}

const SERVICE_SELECT = `
  SELECT id, name, created_at AS createdAt, updated_at AS updatedAt,
    background_media_path AS backgroundMediaPath, background_media_kind AS backgroundMediaKind
  FROM services
`;

export async function listServices(): Promise<Service[]> {
  const db = await getDatabase();
  return db.select<Service[]>(`${SERVICE_SELECT} ORDER BY updated_at DESC`);
}

export async function createService(name: string): Promise<Service> {
  const db = await getDatabase();
  const result = await db.execute(`INSERT INTO services (name) VALUES ($1)`, [name]);
  const id = result.lastInsertId!;
  const rows = await db.select<Service[]>(`${SERVICE_SELECT} WHERE id = $1`, [id]);
  return rows[0];
}

export async function getService(id: number): Promise<Service | null> {
  const db = await getDatabase();
  const rows = await db.select<Service[]>(`${SERVICE_SELECT} WHERE id = $1`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function setServiceBackground(
  id: number,
  path: string | null,
  kind: 'image' | 'video' | null
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE services SET background_media_path = $1, background_media_kind = $2, updated_at = datetime('now') WHERE id = $3`,
    [path, kind, id]
  );
}

export async function updateServiceName(id: number, name: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE services SET name = $1, updated_at = datetime('now') WHERE id = $2`,
    [name, id]
  );
}

export async function deleteService(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM service_items WHERE service_id = $1`, [id]);
  await db.execute(`DELETE FROM services WHERE id = $1`, [id]);
}

const SERVICE_ITEM_SELECT = `
  SELECT id, position, item_type AS itemType, label,
    bible_translation_ids AS bibleTranslationIds, bible_book_id AS bibleBookId,
    bible_chapter AS bibleChapter, bible_verse_start AS bibleVerseStart,
    bible_verse_end AS bibleVerseEnd, song_id AS songId,
    song_language_code AS songLanguageCode, custom_slide_id AS customSlideId
  FROM service_items
`;

export async function getServiceItems(serviceId: number): Promise<ServiceItem[]> {
  const db = await getDatabase();
  const rows = await db.select<ServiceItemRow[]>(
    `${SERVICE_ITEM_SELECT} WHERE service_id = $1 ORDER BY position`,
    [serviceId]
  );
  return rows.map(parseServiceItem);
}

export async function addServiceItem(
  serviceId: number,
  itemType: 'bible' | 'song' | 'custom',
  label: string,
  payload: ServiceItemPayload
): Promise<ServiceItem> {
  const db = await getDatabase();
  const maxPositionRows = await db.select<{ maxPosition: number | null }[]>(
    `SELECT MAX(position) AS maxPosition FROM service_items WHERE service_id = $1`,
    [serviceId]
  );
  const nextPosition = (maxPositionRows[0]?.maxPosition ?? 0) + 1;

  const result = await db.execute(
    `INSERT INTO service_items (
      service_id, position, item_type, label,
      bible_translation_ids, bible_book_id, bible_chapter, bible_verse_start, bible_verse_end,
      song_id, song_language_code, custom_slide_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      serviceId,
      nextPosition,
      itemType,
      label,
      payload.bibleTranslationIds ? JSON.stringify(payload.bibleTranslationIds) : null,
      payload.bibleBookId ?? null,
      payload.bibleChapter ?? null,
      payload.bibleVerseStart ?? null,
      payload.bibleVerseEnd ?? null,
      payload.songId ?? null,
      payload.songLanguageCode ?? null,
      payload.customSlideId ?? null
    ]
  );

  const rows = await db.select<ServiceItemRow[]>(
    `${SERVICE_ITEM_SELECT} WHERE id = $1`,
    [result.lastInsertId]
  );
  return parseServiceItem(rows[0]);
}

export async function updateServiceItemPosition(
  serviceId: number,
  items: Array<{ id: string; position: number }>
): Promise<void> {
  const db = await getDatabase();
  for (const item of items) {
    await db.execute(
      `UPDATE service_items SET position = $1 WHERE id = $2 AND service_id = $3`,
      [item.position, item.id, serviceId]
    );
  }
}

export async function deleteServiceItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM service_items WHERE id = $1`, [id]);
}

export async function duplicateServiceItem(
  serviceId: number,
  itemId: string
): Promise<ServiceItem> {
  const db = await getDatabase();
  const rows = await db.select<ServiceItemRow[]>(
    `${SERVICE_ITEM_SELECT} WHERE id = $1`,
    [itemId]
  );
  if (rows.length === 0) throw new Error('Service item not found');
  const original = rows[0];

  const maxPositionRows = await db.select<{ maxPosition: number | null }[]>(
    `SELECT MAX(position) AS maxPosition FROM service_items WHERE service_id = $1`,
    [serviceId]
  );
  const nextPosition = (maxPositionRows[0]?.maxPosition ?? 0) + 1;

  const result = await db.execute(
    `INSERT INTO service_items (
      service_id, position, item_type, label,
      bible_translation_ids, bible_book_id, bible_chapter, bible_verse_start, bible_verse_end,
      song_id, song_language_code, custom_slide_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      serviceId,
      nextPosition,
      original.itemType,
      original.label,
      original.bibleTranslationIds,
      original.bibleBookId,
      original.bibleChapter,
      original.bibleVerseStart,
      original.bibleVerseEnd,
      original.songId,
      original.songLanguageCode,
      original.customSlideId
    ]
  );

  const newRows = await db.select<ServiceItemRow[]>(
    `${SERVICE_ITEM_SELECT} WHERE id = $1`,
    [result.lastInsertId]
  );
  return parseServiceItem(newRows[0]);
}

const CUSTOM_SLIDE_SELECT = `
  SELECT id, title, body, kind, media_path AS mediaPath, media_kind AS mediaKind, created_at AS createdAt
  FROM custom_slides
`;

export async function getCustomSlide(id: number): Promise<CustomSlide | null> {
  const db = await getDatabase();
  const rows = await db.select<CustomSlide[]>(`${CUSTOM_SLIDE_SELECT} WHERE id = $1`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createCustomSlide(
  title: string | null,
  body: string,
  kind: 'custom' | 'welcome' | 'scripture_custom' = 'custom'
): Promise<CustomSlide> {
  const db = await getDatabase();
  const result = await db.execute(
    `INSERT INTO custom_slides (title, body, kind) VALUES ($1, $2, $3)`,
    [title, body, kind]
  );
  const rows = await db.select<CustomSlide[]>(`${CUSTOM_SLIDE_SELECT} WHERE id = $1`, [result.lastInsertId]);
  return rows[0];
}

export async function createMediaSlide(
  title: string | null,
  mediaPath: string,
  mediaKind: 'image' | 'video'
): Promise<CustomSlide> {
  const db = await getDatabase();
  const result = await db.execute(
    `INSERT INTO custom_slides (title, kind, media_path, media_kind) VALUES ($1, 'media', $2, $3)`,
    [title, mediaPath, mediaKind]
  );
  const rows = await db.select<CustomSlide[]>(`${CUSTOM_SLIDE_SELECT} WHERE id = $1`, [result.lastInsertId]);
  return rows[0];
}
