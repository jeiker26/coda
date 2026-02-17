use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub openai_api_key: Option<String>,
    pub openai_base_url: Option<String>,
    pub anthropic_api_key: Option<String>,
    pub github_token: Option<String>,
    pub slack_webhook_url: Option<String>,
    pub max_changed_files: u32,
    pub max_diff_size: u32,
    pub auto_retry: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            openai_api_key: None,
            openai_base_url: None,
            anthropic_api_key: None,
            github_token: None,
            slack_webhook_url: None,
            max_changed_files: 10,
            max_diff_size: 5000,
            auto_retry: true,
        }
    }
}
