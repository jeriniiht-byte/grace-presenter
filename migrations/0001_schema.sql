-- Languages lookup table
CREATE TABLE languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  font_family TEXT NOT NULL
);

-- Bible translations
CREATE TABLE bible_translations (
  id INTEGER PRIMARY KEY,
  language_code TEXT NOT NULL REFERENCES languages(code),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(language_code, code)
);

-- Bible books (language-independent)
CREATE TABLE bible_books (
  id INTEGER PRIMARY KEY,
  book_number INTEGER NOT NULL UNIQUE,
  testament TEXT NOT NULL CHECK(testament IN ('OT','NT'))
);

-- Bible book names (per translation)
CREATE TABLE bible_book_names (
  book_id INTEGER NOT NULL REFERENCES bible_books(id),
  translation_id INTEGER NOT NULL REFERENCES bible_translations(id),
  name TEXT NOT NULL,
  abbrev TEXT NOT NULL,
  PRIMARY KEY (book_id, translation_id)
);

-- Bible verses
CREATE TABLE bible_verses (
  id INTEGER PRIMARY KEY,
  translation_id INTEGER NOT NULL REFERENCES bible_translations(id),
  book_id INTEGER NOT NULL REFERENCES bible_books(id),
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(translation_id, book_id, chapter, verse)
);
CREATE INDEX idx_verses_lookup ON bible_verses(translation_id, book_id, chapter, verse);

-- Bible FTS5 search (trigram tokenizer for Tamil/Malayalam support)
CREATE VIRTUAL TABLE bible_verses_fts USING fts5(
  text,
  content='bible_verses',
  content_rowid='id',
  tokenize='trigram'
);

-- Keep FTS5 in sync with inserts
CREATE TRIGGER bible_verses_ai AFTER INSERT ON bible_verses BEGIN
  INSERT INTO bible_verses_fts(rowid, text) VALUES (new.id, new.text);
END;

-- Keep FTS5 in sync with deletes
CREATE TRIGGER bible_verses_ad AFTER DELETE ON bible_verses BEGIN
  INSERT INTO bible_verses_fts(bible_verses_fts, rowid, text) VALUES('delete', old.id, old.text);
END;

-- Keep FTS5 in sync with updates
CREATE TRIGGER bible_verses_au AFTER UPDATE ON bible_verses BEGIN
  INSERT INTO bible_verses_fts(bible_verses_fts, rowid, text) VALUES('delete', old.id, old.text);
  INSERT INTO bible_verses_fts(rowid, text) VALUES (new.id, new.text);
END;

-- Songs (language-independent identity)
CREATE TABLE songs (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  default_ccli TEXT,
  structure TEXT NOT NULL
);

-- Song translations (one per language)
CREATE TABLE song_translations (
  id INTEGER PRIMARY KEY,
  song_id INTEGER NOT NULL REFERENCES songs(id),
  language_code TEXT NOT NULL REFERENCES languages(code),
  title TEXT NOT NULL,
  -- Romanized ("Manglish"/"Tanglish") title, so operators who can't read the
  -- native script can still recognize and search for the song.
  transliteration TEXT,
  UNIQUE(song_id, language_code)
);

-- Song sections (per translation)
CREATE TABLE song_sections (
  id INTEGER PRIMARY KEY,
  song_translation_id INTEGER NOT NULL REFERENCES song_translations(id),
  section_key TEXT NOT NULL,
  text TEXT NOT NULL,
  -- Romanized ("Manglish"/"Tanglish") version of this section's text, shown
  -- alongside the native script for operators/congregations who read it phonetically.
  transliteration TEXT
);
CREATE UNIQUE INDEX idx_song_section_key ON song_sections(song_translation_id, section_key);

-- Song FTS5 search
CREATE VIRTUAL TABLE song_sections_fts USING fts5(
  text,
  content='song_sections',
  content_rowid='id',
  tokenize='trigram'
);

CREATE TRIGGER song_sections_ai AFTER INSERT ON song_sections BEGIN
  INSERT INTO song_sections_fts(rowid, text) VALUES (new.id, new.text);
END;

CREATE TRIGGER song_sections_ad AFTER DELETE ON song_sections BEGIN
  INSERT INTO song_sections_fts(song_sections_fts, rowid, text) VALUES('delete', old.id, old.text);
END;

CREATE TRIGGER song_sections_au AFTER UPDATE ON song_sections BEGIN
  INSERT INTO song_sections_fts(song_sections_fts, rowid, text) VALUES('delete', old.id, old.text);
  INSERT INTO song_sections_fts(rowid, text) VALUES (new.id, new.text);
END;

-- Services (presentation playlists)
CREATE TABLE services (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Optional background overriding the active theme's background for this service's slides.
  background_media_path TEXT,
  background_media_kind TEXT CHECK(background_media_kind IN ('image','video'))
);

-- Service items (ordered content in a service)
CREATE TABLE service_items (
  id INTEGER PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('bible','song','custom')),
  -- JSON array of translation ids, e.g. '[1,2]', to support showing multiple languages on one slide.
  bible_translation_ids TEXT,
  bible_book_id INTEGER REFERENCES bible_books(id),
  bible_chapter INTEGER,
  bible_verse_start INTEGER,
  bible_verse_end INTEGER,
  song_id INTEGER REFERENCES songs(id),
  song_language_code TEXT REFERENCES languages(code),
  custom_slide_id INTEGER REFERENCES custom_slides(id),
  label TEXT NOT NULL
);
CREATE INDEX idx_service_items_order ON service_items(service_id, position);

-- Custom slides
CREATE TABLE custom_slides (
  id INTEGER PRIMARY KEY,
  title TEXT,
  -- Text slides use `body`; media slides use `media_path`/`media_kind` instead and leave body null.
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'custom' CHECK(kind IN ('custom','welcome','scripture_custom','media')),
  media_path TEXT,
  media_kind TEXT CHECK(media_kind IN ('image','video')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings (key/value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
