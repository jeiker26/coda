# Coda - AI Coding Agent for macOS

<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="Coda Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A macOS menubar application that automates coding tasks using AI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

Coda is a native macOS desktop application built with Tauri that acts as your personal AI coding assistant. It connects to Claude (Anthropic) or OpenAI to analyze tasks, generate code patches, run tests, and automatically create Pull Requests.

## Features

- **AI-Powered Code Generation**: Supports both Anthropic Claude and OpenAI GPT models
- **Custom API Gateways**: Configure custom base URLs for API proxies/gateways
- **Automatic PR Creation**: Creates branches, commits, pushes, and opens PRs via GitHub CLI
- **Smart Conventions**: Reads repository conventions (husky/commitlint) for proper formatting
- **Slack Notifications**: Get notified when jobs complete or fail
- **Job Persistence**: SQLite database stores job history across restarts
- **Secure Storage**: API keys stored securely in app storage
- **Dry Run Mode**: Test changes without committing
- **Skip Tests Option**: Bypass test execution when needed
- **Snippets Manager**: Save and reuse common task templates

## Installation

### Prerequisites

- macOS 12.0+
- Node.js 18+
- Rust (install via [rustup](https://rustup.rs/))
- GitHub CLI (`brew install gh`) - authenticated with your account

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/coda.git
cd coda

# Install frontend dependencies
npm install

# Install runner dependencies
cd tools/runner && npm install && cd ../..

# Run in development mode
npm run tauri dev

# In another terminal, start the runner
npm run runner
```

### Build for Production

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

## Usage

### Quick Start

1. **Start the Runner**: The background service that executes jobs
   ```bash
   npm run runner
   ```

2. **Launch Coda**: Start the Tauri app
   ```bash
   npm run tauri dev
   ```

3. **Configure Settings**:
   - Go to the **Settings** tab
   - Add your Anthropic or OpenAI API key
   - Select your preferred AI provider
   - Add GitHub token (optional, for Octokit fallback)
   - Configure Slack webhook (optional)
   - Click **Sync to Runner** to apply settings

4. **Create a Task**:
   - Go to the **Tasks** tab
   - Select a repository from the dropdown
   - Describe what you want to accomplish
   - Click **Create Job**

5. **Monitor Progress**:
   - Switch to the **Jobs** tab
   - Watch as your job progresses through stages:
     - `queued` → `coding` → `patching` → `testing` → `pr_opened`
   - Click on a job to see detailed logs
   - Click **PR** button to open the Pull Request in browser

### Task Examples

```
Add input validation to the user registration form

Fix the memory leak in the WebSocket connection handler

Refactor the authentication middleware to use JWT tokens

Add unit tests for the PaymentService class
```

## Architecture

```
coda/
├── src/                    # React frontend (Vite + Tailwind)
│   ├── features/
│   │   ├── jobs/          # Job list, details, status tracking
│   │   ├── taskComposer/  # Create new coding tasks
│   │   ├── settings/      # App configuration
│   │   └── snippets/      # Reusable task templates
│   └── App.tsx
│
├── src-tauri/             # Tauri Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main entry, plugin registration
│   │   └── features/
│   │       ├── jobs/      # Job commands, runner client
│   │       └── settings/  # Keychain integration
│   └── tauri.conf.json
│
└── tools/runner/          # Node.js background service
    └── src/
        ├── index.ts       # HTTP API server (port 3847)
        ├── executor.ts    # Job execution pipeline
        ├── ai-service.ts  # Anthropic/OpenAI integration
        ├── git-service.ts # Git operations, PR creation
        ├── patch-service.ts # Apply code changes
        ├── db-service.ts  # SQLite persistence
        ├── conventions.ts # Branch/commit formatting
        └── slack-service.ts # Notifications
```

### Data Flow

```
┌─────────────┐     HTTP      ┌─────────────┐
│   Tauri     │──────────────▶│   Runner    │
│   (React)   │◀──────────────│  (Node.js)  │
└─────────────┘               └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │ AI APIs  │    │  GitHub  │    │  Slack   │
              │(Claude/  │    │  (gh CLI)│    │ Webhook  │
              │ OpenAI)  │    └──────────┘    └──────────┘
              └──────────┘
```

### Job Execution Pipeline

```
1. Create Job     → Store in SQLite, status: "queued"
2. Coding Phase   → Send task to AI, receive patches
3. Patching Phase → Apply file changes to repo
4. Testing Phase  → Run test commands (if enabled)
5. PR Creation    → Create branch, commit, push, open PR
6. Notification   → Send Slack message (if configured)
```

## Configuration

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `preferredProvider` | AI provider to use | `anthropic` |
| `anthropicApiKey` | Anthropic API key | - |
| `anthropicBaseUrl` | Custom Anthropic API URL | `https://api.anthropic.com` |
| `openaiApiKey` | OpenAI API key | - |
| `openaiBaseUrl` | Custom OpenAI API URL | `https://api.openai.com/v1` |
| `githubToken` | GitHub PAT (fallback for gh CLI) | - |
| `slackWebhookUrl` | Slack incoming webhook | - |
| `maxChangedFiles` | Max files AI can modify | `10` |
| `maxDiffSize` | Max diff lines | `5000` |
| `autoRetry` | Retry failed jobs once | `false` |
| `skipTestsByDefault` | Skip tests by default | `false` |

### Repository Conventions

The runner reads conventions from `tools/runner/repo-conventions.json`:

```json
{
  "branch": {
    "prefix": "agent-",
    "maxLength": 40,
    "mustContainHyphen": true
  },
  "commit": {
    "types": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
    "format": "{type}(agent): {description}",
    "maxLength": 72
  },
  "pr": {
    "titleFormat": "{type}: {description}",
    "bodyTemplate": "## Summary\n\n{explanation}\n\n## Changes\n\n{files}"
  }
}
```

These conventions are based on common setups using husky + commitlint.

## API Reference

### Runner HTTP API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/jobs` | GET | List all jobs |
| `/jobs` | POST | Create new job |
| `/jobs/:id` | GET | Get job details |
| `/jobs/:id/retry` | POST | Retry failed job |
| `/jobs/:id/cancel` | POST | Cancel running job |
| `/repos` | GET | List available git repos |
| `/settings` | GET | Get current settings (masked) |
| `/settings` | POST | Update settings |

### Create Job Request

```json
{
  "task": "Add input validation to login form",
  "repo": "/Users/you/projects/my-app",
  "dryRun": false,
  "skipTests": false
}
```

### Job States

```
queued → coding → patching → testing → pr_opened
           ↓         ↓          ↓
        failed    failed     failed
```

## Data Storage

| Data | Location | Format |
|------|----------|--------|
| Jobs | `~/.mac-agent/jobs.db` | SQLite |
| Settings | App localStorage | JSON |
| API Keys | App localStorage | JSON |

## Troubleshooting

### Port already in use

```bash
# Kill processes on default ports
lsof -ti:1420 | xargs kill -9  # Vite dev server
lsof -ti:3847 | xargs kill -9  # Runner
```

### GitHub CLI not authenticated

```bash
gh auth login
gh auth status  # Verify authentication
```

### PR creation fails for organization repos

Ensure your GitHub CLI has access to the organization:
```bash
gh auth refresh -s repo,read:org
```

### Runner not connecting

1. Ensure runner is started: `npm run runner`
2. Check runner logs in terminal
3. Verify port 3847 is not blocked
4. Click "Sync to Runner" in Settings

### AI API errors

1. Verify API key is correct
2. Check base URL if using a gateway
3. Ensure you have API credits/quota
4. Check runner logs for detailed error

## Development

### Project Scripts

```bash
# Start Tauri development
npm run tauri dev

# Start runner in watch mode
npm run runner

# Build runner
npm run runner:build

# Build production app
npm run tauri build

# Frontend only (no Tauri)
npm run dev
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Desktop | Tauri 2.x (Rust) |
| Runner | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| AI | Anthropic SDK, OpenAI SDK |
| Git | simple-git, GitHub CLI (gh) |

### Adding a New Feature

1. Frontend: Add to `src/features/`
2. Runner: Add service in `tools/runner/src/`
3. Tauri commands: Add in `src-tauri/src/features/`

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.


---

<p align="center">
  Made with Tauri + React + Node.js
</p>
