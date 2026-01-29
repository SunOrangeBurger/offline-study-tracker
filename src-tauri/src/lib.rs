mod models;
mod db;
mod utils;
mod commands;

use commands::AppState;
use db::Database;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize database with app handle
            let db_path_result = app.path().app_local_data_dir();
            
            if db_path_result.is_err() {
                eprintln!("Failed to get app local data dir: {:?}", db_path_result.err());
                return Err("Failed to get app local data directory".into());
            }
            
            let mut db_path = db_path_result.unwrap();
            db_path.push("studyapp.db");
            
            println!("Database path: {:?}", db_path);

            // Create parent directory if it doesn't exist
            if let Some(parent) = db_path.parent() {
                if let Err(e) = std::fs::create_dir_all(parent) {
                    eprintln!("Failed to create app data directory: {}", e);
                    return Err(format!("Failed to create app data directory: {}", e).into());
                }
            }

            let db = match Database::new(db_path.clone()) {
                Ok(db) => db,
                Err(e) => {
                    eprintln!("Failed to initialize database at {:?}: {}", db_path, e);
                    return Err(format!("Failed to initialize database: {}", e).into());
                }
            };

            app.manage(AppState {
                db: Mutex::new(db),
            });

            println!("Database initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_semester,
            commands::get_all_semesters,
            commands::delete_semester,
            commands::create_new_tracker,
            commands::get_trackers_by_semester,
            commands::get_tracker,
            commands::get_tracker_data,
            commands::toggle_topic,
            commands::schedule_test,
            commands::get_tests_by_tracker,
            commands::get_test_details,
            commands::get_theme,
            commands::set_theme,
            commands::create_subject,
            commands::update_subject,
            commands::delete_subject,
            commands::create_topic,
            commands::update_topic,
            commands::delete_topic,
            commands::export_syllabus,
            commands::import_syllabus,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
