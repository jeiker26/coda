use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Job {
    pub id: String,
    pub task: String,
    pub repo: String,
    pub branch: Option<String>,
    pub status: JobStatus,
    pub pr_url: Option<String>,
    pub error: Option<String>,
    pub logs: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JobStatus {
    Queued,
    Coding,
    Patching,
    Testing,
    PrOpened,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateJobRequest {
    pub task: String,
    pub repo: String,
    #[serde(default)]
    pub dry_run: bool,
}
