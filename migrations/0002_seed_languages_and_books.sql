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

-- English book names
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (1, 1, 'Genesis', 'Gen'),
  (2, 1, 'Exodus', 'Exo'),
  (3, 1, 'Leviticus', 'Lev'),
  (4, 1, 'Numbers', 'Num'),
  (5, 1, 'Deuteronomy', 'Deu'),
  (6, 1, 'Joshua', 'Jos'),
  (7, 1, 'Judges', 'Jdg'),
  (8, 1, 'Ruth', 'Rut'),
  (9, 1, '1 Samuel', '1Sa'),
  (10, 1, '2 Samuel', '2Sa'),
  (11, 1, '1 Kings', '1Ki'),
  (12, 1, '2 Kings', '2Ki'),
  (13, 1, '1 Chronicles', '1Ch'),
  (14, 1, '2 Chronicles', '2Ch'),
  (15, 1, 'Ezra', 'Ezr'),
  (16, 1, 'Nehemiah', 'Neh'),
  (17, 1, 'Esther', 'Est'),
  (18, 1, 'Job', 'Job'),
  (19, 1, 'Psalms', 'Psa'),
  (20, 1, 'Proverbs', 'Pro'),
  (21, 1, 'Ecclesiastes', 'Ecc'),
  (22, 1, 'Song of Solomon', 'Sng'),
  (23, 1, 'Isaiah', 'Isa'),
  (24, 1, 'Jeremiah', 'Jer'),
  (25, 1, 'Lamentations', 'Lam'),
  (26, 1, 'Ezekiel', 'Eze'),
  (27, 1, 'Daniel', 'Dan'),
  (28, 1, 'Hosea', 'Hos'),
  (29, 1, 'Joel', 'Joe'),
  (30, 1, 'Amos', 'Amo'),
  (31, 1, 'Obadiah', 'Oba'),
  (32, 1, 'Jonah', 'Jon'),
  (33, 1, 'Micah', 'Mic'),
  (34, 1, 'Nahum', 'Nah'),
  (35, 1, 'Habakkuk', 'Hab'),
  (36, 1, 'Zephaniah', 'Zep'),
  (37, 1, 'Haggai', 'Hag'),
  (38, 1, 'Zechariah', 'Zec'),
  (39, 1, 'Malachi', 'Mal'),
  (40, 1, 'Matthew', 'Mat'),
  (41, 1, 'Mark', 'Mar'),
  (42, 1, 'Luke', 'Luk'),
  (43, 1, 'John', 'Jhn'),
  (44, 1, 'Acts', 'Act'),
  (45, 1, 'Romans', 'Rom'),
  (46, 1, '1 Corinthians', '1Co'),
  (47, 1, '2 Corinthians', '2Co'),
  (48, 1, 'Galatians', 'Gal'),
  (49, 1, 'Ephesians', 'Eph'),
  (50, 1, 'Philippians', 'Php'),
  (51, 1, 'Colossians', 'Col'),
  (52, 1, '1 Thessalonians', '1Th'),
  (53, 1, '2 Thessalonians', '2Th'),
  (54, 1, '1 Timothy', '1Ti'),
  (55, 1, '2 Timothy', '2Ti'),
  (56, 1, 'Titus', 'Tit'),
  (57, 1, 'Philemon', 'Phm'),
  (58, 1, 'Hebrews', 'Heb'),
  (59, 1, 'James', 'Jas'),
  (60, 1, '1 Peter', '1Pe'),
  (61, 1, '2 Peter', '2Pe'),
  (62, 1, '1 John', '1Jo'),
  (63, 1, '2 John', '2Jo'),
  (64, 1, '3 John', '3Jo'),
  (65, 1, 'Jude', 'Jud'),
  (66, 1, 'Revelation', 'Rev');

-- Tamil book names (sample - key books)
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (19, 2, 'சங்கீதம்', 'சங்'),
  (43, 2, 'யோவான்', 'யோ'),
  (45, 2, 'ரோமர்', 'ரோ');

-- Malayalam book names (sample - key books)
INSERT INTO bible_book_names (book_id, translation_id, name, abbrev) VALUES
  (19, 3, 'സങ്കീർത്തനങ്ങൾ', 'സങ്'),
  (43, 3, 'യോഹന്നാൻ', 'യോ'),
  (45, 3, 'റോമാക്കാർ', 'റോ');

-- Initialize settings with defaults
INSERT INTO settings (key, value) VALUES
  ('defaultBibleTranslationId', '1'),
  ('defaultBibleLanguage', 'en'),
  ('defaultSongLanguage', 'en'),
  ('defaultTheme', 'salemag');
