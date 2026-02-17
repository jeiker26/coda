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
  <a href="#slack-integration">Slack</a> •
  <a href="#skills-system">Skills</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#configuration">Configuration</a>
</p>

---

## Overview

Coda is a native macOS desktop application built with Tauri that acts as your personal AI coding assistant. It connects to Claude (Anthropic) or OpenAI to analyze tasks, generate code patches, run tests, and automatically create Pull Requests.

**Key highlights:**
- Run coding tasks from the app or directly from Slack
- Skills system to give AI context about your repos
- Automatic PR creation following your repo conventions
- Support for custom API gateways (proxies)

## Features

| Feature | Description |
|---------|-------------|
| **AI Code Generation** | Anthropic Claude and OpenAI GPT support |
| **Custom API Gateways** | Configure custom base URLs for API proxies |
| **Automatic PRs** | Creates branches, commits, pushes, and opens PRs via GitHub CLI |
| **Smart Conventions** | Reads repo conventions (husky/commitlint) for proper formatting |
| **Skills System** | Assign coding guidelines and context per repository |
| **Predefined Tasks** | Save and reuse common task templates |
| **Slack Integration** | Notifications + run tasks directly from Slack |
| **Job Persistence** | SQLite database stores job history across restarts |
| **Dry Run Mode** | Test changes without committing |

## Installation

### Prerequisites

- macOS 12.0+
- Node.js 18+
- Rust (install via [rustup](https://rustup.rs/))
- GitHub CLI - authenticated with your account
  ```bash
  brew install gh
  gh auth login
  ```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/coda.git
cd coda

# Install dependencies
npm install
cd tools/runner && npm install && cd ../..

# Start the runner (Terminal 1)
npm run runner

# Start the app (Terminal 2)
npm run tauri dev
```

### Build for Production

```bash
npm run tauri build
```

The built `.app` bundle will be in `src-tauri/target/release/bundle/macos/`.

## Usage

### 1. Configure Settings

1. Go to **Settings** tab
2. Add your **Anthropic** or **OpenAI** API key
3. Select preferred AI provider
4. (Optional) Add Slack webhook for notifications
5. Click **Sync to Runner**

### 2. Add Repositories

In Settings, click on available repos from WebstormProjects to add them, or enter a custom path.

### 3. Assign Skills (Optional)

Expand a repo in Settings to assign skills (coding guidelines) that will be included in AI prompts.

### 4. Create Tasks

**Option A: Predefined Tasks**
- Go to **Tasks** tab
- Create a reusable task with name, repo, and prompt
- Click **Run** to execute

**Option B: Ad-hoc Prompts**
- Go to **Prompt** tab
- Select repo, write your task, click **Create Job**

**Option C: From Slack**
```
@Coda prompt "Add input validation to login form" repo:my-app
```

### 5. Monitor Jobs

- **Jobs** tab shows all jobs with status
- Click a job to see logs and details
- Click **PR** button to open the Pull Request

### Task Examples

```
Add input validation to the user registration form

Fix the memory leak in the WebSocket connection handler

Refactor the authentication middleware to use JWT tokens

Add unit tests for the PaymentService class

Update all deprecated API calls to v2
```

## Slack Integration

Coda supports two Slack integration modes:

### Webhook (Notifications Only)

Simple one-way notifications when jobs complete or fail.

1. Create a Slack App at https://api.slack.com/apps
2. Enable **Incoming Webhooks**
3. Create a webhook for your channel
4. Add the webhook URL in Coda Settings

### Socket Mode (Bidirectional)

Run tasks and get updates directly from Slack.

#### Setup

1. **Create Slack App** at https://api.slack.com/apps
   - "Create New App" → "From scratch"
   - Name: "Coda", select your workspace

2. **Enable Socket Mode**
   - Sidebar → "Socket Mode" → Toggle ON
   - Create App-Level Token with `connections:write` scope
   - Save token (starts with `xapp-`)

3. **Configure Bot Permissions**
   - "OAuth & Permissions" → Add Bot Token Scopes:
     - `app_mentions:read`
     - `chat:write`
     - `channels:history`
     - `im:history`
   - Install app to workspace
   - Save Bot Token (starts with `xoxb-`)

4. **Enable Events**
   - "Event Subscriptions" → Toggle ON
   - Subscribe to: `app_mention`, `message.channels`, `message.im`

5. **Configure Coda**
   - Add both tokens in Settings
   - Click "Sync to Runner"
   - Status should show "connected"

6. **Invite Bot**
   ```
   /invite @Coda
   ```

#### Slack Commands

```
@Coda help                                    # Show all commands
@Coda list jobs                               # Recent jobs
@Coda status job-abc123                       # Job details
@Coda cancel job-abc123                       # Cancel a job
@Coda prompt "Add tests" repo:frontend        # Run a prompt
```

## Skills System

Skills are coding guidelines and context that get injected into AI prompts.

### Built-in Skills

Coda includes 10+ built-in skills:
- **Languages**: TypeScript, React, Python
- **Tools**: Docker, Git workflows
- **Patterns**: Clean Code, SOLID principles
- **Domains**: REST API design, Testing best practices

### Custom Skills

Create your own skills in the **Skills** tab:
- Project-specific conventions
- Domain knowledge
- Code style preferences

### Assigning Skills

1. Go to **Settings**
2. Expand a repository
3. Check skills to apply
4. Skills are automatically included when creating jobs for that repo

## Architecture

```
coda/
├── src/                    # React frontend (Vite + Tailwind)
│   └── features/
│       ├── jobs/           # Job list, details, status
│       ├── tasks/          # Predefined task templates
│       ├── taskComposer/   # Ad-hoc prompt creation
│       ├── skills/         # Skills management
│       └── settings/       # Configuration
│
├── src-tauri/              # Tauri Rust backend
│   └── src/
│       ├── lib.rs          # Main entry, commands
│       └── features/       # Rust modules
│
└── tools/runner/           # Node.js background service
    └── src/
        ├── index.ts        # HTTP API (port 3847)
        ├── executor.ts     # Job execution pipeline
        ├── ai-service.ts   # Claude/OpenAI integration
        ├── git-service.ts  # Git operations, PR creation
        ├── patch-service.ts# Apply code changes
        ├── db-service.ts   # SQLite persistence
        ├── slack-service.ts# Webhook notifications
        └── slack-bot.ts    # Socket Mode commands
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
              │(Claude/  │    │  (gh CLI)│    │(Webhook/ │
              │ OpenAI)  │    └──────────┘    │ Socket)  │
              └──────────┘                    └──────────┘
```

### Job Pipeline

```
1. Create    → Store in SQLite (queued)
2. Coding    → Send to AI, receive patches
3. Patching  → Apply file changes
4. Testing   → Run test commands (optional)
5. PR        → Branch, commit, push, open PR
6. Notify    → Slack message
```

## Configuration

### Settings Reference

| Setting | Description | Default |
|---------|-------------|---------|
| `preferredProvider` | AI provider | `anthropic` |
| `anthropicApiKey` | Anthropic API key | - |
| `anthropicBaseUrl` | Custom API URL | `https://api.anthropic.com` |
| `openaiApiKey` | OpenAI API key | - |
| `openaiBaseUrl` | Custom API URL | `https://api.openai.com/v1` |
| `githubToken` | GitHub PAT (fallback) | - |
| `slackWebhookUrl` | Webhook URL | - |
| `slackAppToken` | Socket Mode app token | - |
| `slackBotToken` | Socket Mode bot token | - |
| `maxChangedFiles` | Max files per job | `10` |
| `maxDiffSize` | Max diff lines | `5000` |
| `autoRetry` | Retry failed jobs | `true` |
| `skipTestsByDefault` | Skip tests | `true` |

### Conventions

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
  }
}
```

### Data Storage

| Data | Location |
|------|----------|
| Jobs database | `~/.mac-agent/jobs.db` |
| App settings | Browser localStorage |
| API keys | Browser localStorage |

## API Reference

### Runner Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check + Slack status |
| `/repos` | GET | List git repositories |
| `/jobs` | GET | List all jobs |
| `/jobs` | POST | Create job |
| `/jobs/:id` | GET | Get job details |
| `/jobs/:id/retry` | POST | Retry failed job |
| `/jobs/:id/cancel` | POST | Cancel running job |
| `/settings` | GET | Get settings (masked) |
| `/settings` | POST | Update settings |

### Create Job

```bash
curl -X POST http://localhost:3847/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add input validation",
    "repo": "/path/to/repo",
    "skipTests": true,
    "skills": [{"name": "TypeScript", "content": "..."}]
  }'
```

## Troubleshooting

### Runner not connecting

```bash
# Check if runner is running
curl http://localhost:3847/health

# Kill existing processes
lsof -ti:3847 | xargs kill -9

# Restart runner
npm run runner
```

### GitHub CLI issues

```bash
# Verify authentication
gh auth status

# Re-authenticate
gh auth login

# For org repos, add org scope
gh auth refresh -s repo,read:org
```

### Slack bot not responding

1. Verify tokens are correct (xapp-... and xoxb-...)
2. Check runner logs for connection status
3. Ensure bot is invited to channel: `/invite @Coda`
4. Check Event Subscriptions are enabled in Slack App

### AI errors

1. Verify API key is valid
2. Check if using custom base URL correctly
3. Ensure you have API credits
4. Check runner logs for detailed error

## Development

### Scripts

```bash
npm run dev          # Frontend only (Vite)
npm run tauri dev    # Full Tauri app
npm run runner       # Start runner (watch mode)
npm run runner:build # Build runner
npm run build        # Build frontend
npm run tauri build  # Build production app
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Desktop | Tauri 2.x (Rust) |
| Runner | Node.js 18+, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| AI | Anthropic SDK, OpenAI SDK |
| Git | simple-git, GitHub CLI |
| Slack | @slack/bolt (Socket Mode) |

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

---

<p align="center">
  Built with Tauri + React + Node.js
</p>
