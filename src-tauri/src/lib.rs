#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:grace.db", migrations::all())
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
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
      Migration {
        version: 3,
        description: "seed_sample_content",
        sql: include_str!("../../migrations/0003_seed_sample_content.sql"),
        kind: tauri_plugin_sql::MigrationKind::Up,
      },
      Migration {
        version: 4,
        description: "import_verseview_bible",
        sql: include_str!("../../migrations/0004_import_verseview_bible.sql"),
        kind: tauri_plugin_sql::MigrationKind::Up,
      },
      Migration {
        version: 5,
        description: "import_verseview_songs",
        sql: include_str!("../../migrations/0005_import_verseview_songs.sql"),
        kind: tauri_plugin_sql::MigrationKind::Up,
      },
    ]
  }
}
