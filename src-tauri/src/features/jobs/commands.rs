use tauri::State;
use crate::features::jobs::types::{Job, CreateJobRequest};
use crate::features::jobs::runner_client::RunnerClient;

#[tauri::command]
pub async fn jobs_create(
    request: CreateJobRequest,
    client: State<'_, RunnerClient>,
) -> Result<Job, String> {
    client.create_job(request).await
}

#[tauri::command]
pub async fn jobs_list(client: State<'_, RunnerClient>) -> Result<Vec<Job>, String> {
    client.list_jobs().await
}

#[tauri::command]
pub async fn jobs_detail(id: String, client: State<'_, RunnerClient>) -> Result<Job, String> {
    client.get_job(&id).await
}

#[tauri::command]
pub async fn jobs_retry(id: String, client: State<'_, RunnerClient>) -> Result<Job, String> {
    client.retry_job(&id).await
}

#[tauri::command]
pub async fn jobs_cancel(id: String, client: State<'_, RunnerClient>) -> Result<Job, String> {
    client.cancel_job(&id).await
}
