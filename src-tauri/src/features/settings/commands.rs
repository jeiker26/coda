use tauri::command;
use crate::features::settings::keychain::KeychainService;

#[command]
pub fn settings_set_secret(key: String, value: String) -> Result<(), String> {
    KeychainService::set_secret(&key, &value)
}

#[command]
pub fn settings_get_secret(key: String) -> Result<Option<String>, String> {
    KeychainService::get_secret(&key)
}

#[command]
pub fn settings_delete_secret(key: String) -> Result<(), String> {
    KeychainService::delete_secret(&key)
}
