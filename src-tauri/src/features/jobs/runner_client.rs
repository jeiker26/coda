use reqwest::Client;
use crate::features::jobs::types::{Job, CreateJobRequest};

const RUNNER_URL: &str = "http://localhost:3847";

pub struct RunnerClient {
    client: Client,
}

impl RunnerClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn create_job(&self, request: CreateJobRequest) -> Result<Job, String> {
        let response = self
            .client
            .post(format!("{}/jobs", RUNNER_URL))
            .json(&request)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        response.json().await.map_err(|e| e.to_string())
    }

    pub async fn list_jobs(&self) -> Result<Vec<Job>, String> {
        let response = self
            .client
            .get(format!("{}/jobs", RUNNER_URL))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        response.json().await.map_err(|e| e.to_string())
    }

    pub async fn get_job(&self, id: &str) -> Result<Job, String> {
        let response = self
            .client
            .get(format!("{}/jobs/{}", RUNNER_URL, id))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        response.json().await.map_err(|e| e.to_string())
    }

    pub async fn retry_job(&self, id: &str) -> Result<Job, String> {
        let response = self
            .client
            .post(format!("{}/jobs/{}/retry", RUNNER_URL, id))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        response.json().await.map_err(|e| e.to_string())
    }

    pub async fn cancel_job(&self, id: &str) -> Result<Job, String> {
        let response = self
            .client
            .post(format!("{}/jobs/{}/cancel", RUNNER_URL, id))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        response.json().await.map_err(|e| e.to_string())
    }
}

impl Default for RunnerClient {
    fn default() -> Self {
        Self::new()
    }
}
