# Coda Roadmap

## Current Status: v0.1.0 (MVP)

The initial version provides core functionality for AI-powered code automation.

---

## Completed Features

### Core
- [x] Tauri desktop app with React frontend
- [x] Node.js runner daemon with HTTP API
- [x] Job queue with status tracking
- [x] SQLite persistence for jobs

### AI Integration
- [x] Anthropic Claude support
- [x] OpenAI GPT support
- [x] Custom base URLs for API gateways
- [x] Provider switching via UI
- [x] Skills system for AI context injection

### Git & GitHub
- [x] Automatic branch creation with conventions
- [x] Commit formatting (conventional commits)
- [x] Push to remote
- [x] PR creation via `gh` CLI

### UI/UX
- [x] Tab-based navigation (Tasks, Prompt, Jobs, Skills, Settings)
- [x] Predefined tasks with save/edit/delete
- [x] Jobs list with status indicators
- [x] Job details with logs
- [x] Settings panel with sync to runner
- [x] Skills library (built-in + custom)
- [x] Repo skills assignment

### Integrations
- [x] Slack webhook notifications (detailed blocks)
- [x] Slack Socket Mode (bidirectional commands)

---

## Short Term (v0.2.0)

### High Priority
- [ ] **Menubar tray mode** - Run as menubar app instead of window
- [ ] **Auto-start runner** - Launch runner automatically with app
- [ ] **Real-time job updates** - WebSocket or SSE for live status
- [ ] **Fix PR link opening** - Improve Tauri shell API integration

### Medium Priority
- [ ] **Job filtering** - Filter by status, repo, date
- [ ] **Job search** - Search tasks and logs
- [ ] **Keyboard shortcuts** - Quick actions (Cmd+N, Cmd+R)
- [ ] **Dark/Light theme** - Follow system preference

### Low Priority
- [ ] **Export job history** - CSV/JSON export
- [ ] **Clear old jobs** - Bulk delete completed jobs
- [ ] **Job statistics** - Success rate, avg time

---

## Medium Term (v0.3.0)

### Multi-step Tasks
- [ ] **Task chaining** - Run multiple related tasks in sequence
- [ ] **Conditional execution** - If tests pass, then create PR
- [ ] **Task dependencies** - Task B waits for Task A

### Enhanced AI
- [ ] **Context awareness** - Read more project files for context
- [ ] **Code review mode** - Review existing PRs
- [ ] **Explain code** - Get explanations without changes
- [ ] **Streaming responses** - See AI output in real-time

### Repository Features
- [ ] **Diff preview** - See changes before applying
- [ ] **Rollback** - Undo applied patches
- [ ] **Branch cleanup** - Delete merged branches

### Slack Enhancements
- [ ] **Predefined tasks from Slack** - Run saved tasks by name
- [ ] **Interactive buttons** - Approve/Cancel from Slack
- [ ] **Thread replies** - Updates in thread instead of channel

---

## Long Term (v1.0.0)

### Advanced Features
- [ ] **Local LLM support** - Ollama, LMStudio integration
- [ ] **Interactive mode** - Ask AI follow-up questions
- [ ] **Learning mode** - Remember project patterns

### Team Features
- [ ] **Shared skills** - Team skills library
- [ ] **Shared tasks** - Team task templates
- [ ] **Usage analytics** - Track AI usage and costs

### Platform Expansion
- [ ] **Windows support** - Tauri cross-platform
- [ ] **Linux support** - Tauri cross-platform
- [ ] **VS Code extension** - Integrated experience
- [ ] **JetBrains plugin** - WebStorm/IntelliJ integration

### Enterprise
- [ ] **SSO authentication** - SAML/OIDC support
- [ ] **Audit logging** - Track all actions
- [ ] **Self-hosted runner** - Cloud deployment option

---

## Technical Debt

### Code Quality
- [ ] Add unit tests for runner services
- [ ] Add E2E tests for Tauri app
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add ESLint + Prettier configuration
- [ ] TypeScript strict mode

### Performance
- [ ] Optimize SQLite queries with indexes
- [ ] Lazy load job logs
- [ ] Virtual scrolling for long job lists

### Security
- [ ] Migrate API keys to macOS Keychain
- [ ] Validate and sanitize AI responses
- [ ] Rate limiting on runner API

---

## Contributing

Want to help? Pick an item from the roadmap and:

1. Check if there's an existing issue
2. Create an issue if not
3. Comment that you're working on it
4. Submit a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes
