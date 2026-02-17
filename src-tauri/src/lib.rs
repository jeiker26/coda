mod features;

use features::jobs::{
    jobs_create, jobs_list, jobs_detail, jobs_retry, jobs_cancel, RunnerClient,
};
use features::settings::{settings_set_secret, settings_get_secret, settings_delete_secret};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .manage(RunnerClient::new())
        .invoke_handler(tauri::generate_handler![
            jobs_create,
            jobs_list,
            jobs_detail,
            jobs_retry,
            jobs_cancel,
            settings_set_secret,
            settings_get_secret,
            settings_delete_secret,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
