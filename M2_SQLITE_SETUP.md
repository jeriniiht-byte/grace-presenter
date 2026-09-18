# M2: SQLite Plugin & Schema Setup

After successfully running `npx tauri init`, follow these steps to add the SQLite plugin and database schema.

## Step 1: Add tauri-plugin-sql to Cargo.toml

In `src-tauri/Cargo.toml`, add the plugin to the `[dependencies]` section:

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

## Step 2: Update src-tauri/src/lib.rs

Replace the contents of `src-tauri/src/lib.rs` with:

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:grace.db", migrations::all())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod migrations {
    use tauri_plugin_sql::Migration;

    pub fn all() -> Vec<Migration> {
        vec![
            Migration {
                version: 1,
                description: "create_initial_schema",
                sql: include_str!("../../migrations/0001_schema.sql"),
                kind: tauri_plugin_sql::MigrationKind::Up,
            },
            Migration {
                version: 2,
                description: "seed_languages_and_books",
                sql: include_str!("../../migrations/0002_seed_languages_and_books.sql"),
                kind: tauri_plugin_sql::MigrationKind::Up,
            },
        ]
    }
}
```

## Step 3: Create Migrations Directory

Create the directory: `src-tauri/../../migrations/`

(This is `<project-root>/migrations/`)

## Step 4: Create Migration Files

### 0001_schema.sql

Create `migrations/0001_schema.sql` with the complete database schema:

```sql
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
  UNIQUE(song_id, language_code)
);

-- Song sections (per translation)
CREATE TABLE song_sections (
  id INTEGER PRIMARY KEY,
  song_translation_id INTEGER NOT NULL REFERENCES song_translations(id),
  section_key TEXT NOT NULL,
  text TEXT NOT NULL
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Service items (ordered content in a service)
CREATE TABLE service_items (
  id INTEGER PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('bible','song','custom')),
  bible_translation_id INTEGER REFERENCES bible_translations(id),
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
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'custom' CHECK(kind IN ('custom','welcome','scripture_custom')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings (key/value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### 0002_seed_languages_and_books.sql

Create `migrations/0002_seed_languages_and_books.sql` to seed initial languages and all 66 Bible books:

```sql
-- Insert languages
INSERT INTO languages (code, name, font_family) VALUES
  ('en', 'English', 'Noto Sans, Inter, system-ui, sans-serif'),
  ('ta', 'Tamil', 'Noto Sans Tamil, Noto Sans, sans-serif'),
  ('ml', 'Malayalam', 'Noto Sans Malayalam, Noto Sans, sans-serif');

-- Create Bible translations
INSERT INTO bible_translations (language_code, code, name) VALUES
  ('en', 'KJV', 'King James Version'),
  ('ta', 'TOV', 'Tamil OV'),
  ('ml', 'POC', 'Malayalam POC');

-- Insert all 66 Bible books (canonical order)
INSERT INTO bible_books (book_number, testament) VALUES
  (1, 'OT'), (2, 'OT'), (3, 'OT'), (4, 'OT'), (5, 'OT'),
  (6, 'OT'), (7, 'OT'), (8, 'OT'), (9, 'OT'), (10, 'OT'),
  (11, 'OT'), (12, 'OT'), (13, 'OT'), (14, 'OT'), (15, 'OT'),
  (16, 'OT'), (17, 'OT'), (18, 'OT'), (19, 'OT'), (20, 'OT'),
  (21, 'OT'), (22, 'OT'), (23, 'OT'), (24, 'OT'), (25, 'OT'),
  (26, 'OT'), (27, 'OT'), (28, 'OT'), (29, 'OT'), (30, 'OT'),
  (31, 'OT'), (32, 'OT'), (33, 'OT'), (34, 'OT'), (35, 'OT'),
  (36, 'OT'), (37, 'OT'), (38, 'OT'), (39, 'OT'),
  (40, 'NT'), (41, 'NT'), (42, 'NT'), (43, 'NT'), (44, 'NT'),
  (45, 'NT'), (46, 'NT'), (47, 'NT'), (48, 'NT'), (49, 'NT'),
  (50, 'NT'), (51, 'NT'), (52, 'NT'), (53, 'NT'), (54, 'NT'),
  (55, 'NT'), (56, 'NT'), (57, 'NT'), (58, 'NT'), (59, 'NT'),
  (60, 'NT'), (61, 'NT'), (62, 'NT'), (63, 'NT'), (64, 'NT'),
  (65, 'NT'), (66, 'NT');

-- English book names (sample, add all 66)
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (1, 1, 'Genesis', 'Gen'),
  (2, 1, 'Exodus', 'Exo'),
  (3, 1, 'Leviticus', 'Lev'),
  (4, 1, 'Numbers', 'Num'),
  (5, 1, 'Deuteronomy', 'Deu'),
  -- ... (continues for all 66 books)
  -- Key books to include: John (book 43), Psalms (book 19), Romans (book 45)
  (19, 1, 'Psalms', 'Psa'),
  (43, 1, 'John', 'Jhn'),
  (45, 1, 'Romans', 'Rom');

-- Tamil book names (sample)
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (19, 2, 'சங்கீதம்', 'சங்'),
  (43, 2, 'யோவான்', 'யோ'),
  (45, 2, 'ரோமர்', 'ரோ');

-- Malayalam book names (sample)
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (19, 3, 'സങ്കീർത്തനങ്ങൾ', 'സങ്'),
  (43, 3, 'യോഹന്നാൻ', 'യോ'),
  (45, 3, 'റോമാക്കാർ', 'റോ');

-- Initialize settings with defaults
INSERT INTO settings (key, value) VALUES
  ('defaultBibleTranslationId', '1'),
  ('defaultBibleLanguage', 'en'),
  ('defaultSongLanguage', 'en'),
  ('defaultTheme', 'dark');
```

**Note:** The book names above are abbreviated. You'll need to expand this with all 66 books in English, Tamil, and Malayalam. Placeholder names are acceptable for MVP testing.

## Step 5: Update src-tauri/src/main.rs

Ensure `main.rs` properly initializes the app:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    grace_presenter_lib::run();
}
```

## Step 6: Test the Setup

Run:
```bash
npm run tauri:dev
```

This will:
1. Compile the Rust code (first time takes 5-10 minutes)
2. Create `grace.db` with your schema and seed data
3. Launch the app window

If you see database errors, check:
- Cargo.toml has the correct plugin dependencies
- Migration SQL files are in `migrations/` (relative to `src-tauri/`)
- The migration include paths in `lib.rs` are correct

## Status
✅ M2 prep complete. Follow steps 1-6 after `tauri init` finishes.
