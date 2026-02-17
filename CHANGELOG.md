# Changelog

All notable changes to Coda will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-17

### Added

- **Tauri Desktop Application**: macOS menubar app with system tray integration
- **Node.js Agent Runner**: Background daemon running on port 3847
- **AI Integration**: Support for both Anthropic (Claude) and OpenAI APIs
  - Custom base URL support for API gateways
  - Provider toggle in settings
- **Task Management**:
  - Predefined tasks with name, prompt, repo selection, and skipTests option
  - Ad-hoc prompts via Task Composer
  - Job queue with status tracking (pending, running, completed, failed)
- **Skills System**:
  - 11 built-in skills covering languages, tools, domains, and code styles
  - Custom skill creation with markdown content
  - Per-repository skill assignments
  - Skills automatically included in AI context
- **Git Integration**:
  - Automatic branch creation following conventions (hyphen required, max 40 chars)
  - Conventional commits: `type(scope): description`
  - Push to remote with upstream tracking
  - Pull Request creation via `gh` CLI
- **Slack Integration**:
  - Webhook notifications with detailed blocks (job status, PR links)
  - Socket Mode for bidirectional communication
  - Commands: `@Coda help`, `list jobs`, `status <id>`, `cancel <id>`, `prompt "..." repo:...`
- **Repository Management**: Auto-detection of git repos in WebstormProjects
- **Persistence**: SQLite database for jobs at `~/.mac-agent/jobs.db`
- **Settings**: API keys and Slack tokens stored locally via zustand/persist

### Technical Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + React Query
- **Backend**: Tauri 2.x (Rust) + Node.js 18+
- **Database**: SQLite (better-sqlite3)
- **APIs**: Anthropic SDK, OpenAI SDK, Slack Bolt

### Known Issues

- PR link button may not open URLs (Tauri shell API configuration needed)

---

## Future Releases

See [ROADMAP.md](./ROADMAP.md) for planned features including:
- Real-time log streaming
- Job retry functionality
- Multi-repo batch operations
- Enhanced Slack threading
- macOS notifications
