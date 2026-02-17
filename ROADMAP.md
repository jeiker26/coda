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

### Git & GitHub
- [x] Automatic branch creation with conventions
- [x] Commit formatting (conventional commits)
- [x] Push to remote
- [x] PR creation via `gh` CLI
- [x] Octokit fallback for PR creation

### UI/UX
- [x] Task composer with repo selector
- [x] Jobs list with status indicators
- [x] Job details with logs
- [x] Settings panel
- [x] Snippets manager
- [x] Sync to Runner button

---

## Short Term (v0.2.0)

### High Priority
- [ ] **Fix PR link opening** - Use Tauri shell API correctly
- [ ] **Menubar tray mode** - Run as menubar app instead of window
- [ ] **Auto-start runner** - Launch runner automatically with app
- [ ] **Real-time job updates** - WebSocket or SSE for live status

### Medium Priority
- [ ] **Job filtering** - Filter by status, repo, date
- [ ] **Job search** - Search tasks and logs
- [ ] **Keyboard shortcuts** - Quick actions
- [ ] **Dark/Light theme** - Follow system preference

### Low Priority
- [ ] **Export job history** - CSV/JSON export
- [ ] **Clear old jobs** - Bulk delete completed jobs

---

## Medium Term (v0.3.0)

### Multi-step Tasks
- [ ] **Task chaining** - Run multiple related tasks
- [ ] **Conditional execution** - If tests pass, then deploy
- [ ] **Task templates** - Complex predefined workflows

### Enhanced AI
- [ ] **Context awareness** - Read more project files for context
- [ ] **Multi-file understanding** - Better cross-file changes
- [ ] **Code review mode** - Review existing PRs
- [ ] **Explain code** - Get explanations without changes

### Repository Features
- [ ] **Branch management** - View/switch branches
- [ ] **Diff preview** - See changes before applying
- [ ] **Rollback** - Undo applied patches
- [ ] **Stash support** - Handle dirty working directory

### Integrations
- [ ] **Jira integration** - Create tasks from Jira tickets
- [ ] **Linear integration** - Create tasks from Linear issues
- [ ] **Discord notifications** - Alternative to Slack
- [ ] **Microsoft Teams** - Webhook notifications

---

## Long Term (v1.0.0)

### Advanced Features
- [ ] **Local LLM support** - Ollama, LMStudio integration
- [ ] **Code streaming** - See AI output in real-time
- [ ] **Interactive mode** - Ask AI follow-up questions
- [ ] **Learning mode** - Remember project patterns

### Team Features
- [ ] **Shared snippets** - Team snippet library
- [ ] **Usage analytics** - Track AI usage and costs
- [ ] **Rate limiting** - Control API spend

### Enterprise
- [ ] **SSO authentication** - SAML/OIDC support
- [ ] **Audit logging** - Track all actions
- [ ] **Custom conventions** - Per-org configuration
- [ ] **Self-hosted runner** - Cloud deployment option

### Platform Expansion
- [ ] **Windows support** - Tauri cross-platform
- [ ] **Linux support** - Tauri cross-platform
- [ ] **VS Code extension** - Integrated experience
- [ ] **JetBrains plugin** - WebStorm/IntelliJ integration

---

## Technical Debt

### Code Quality
- [ ] Add unit tests for runner services
- [ ] Add E2E tests for Tauri app
- [ ] Set up CI/CD pipeline
- [ ] Add ESLint/Prettier configuration
- [ ] TypeScript strict mode

### Performance
- [ ] Optimize SQLite queries
- [ ] Add database indexes
- [ ] Lazy load job logs
- [ ] Virtual scrolling for long lists

### Security
- [ ] Migrate API keys to Keychain
- [ ] Add request signing
- [ ] Validate AI responses
- [ ] Sanitize file paths

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

---

## Feedback

Have ideas for the roadmap? 

- Open a [GitHub Issue](https://github.com/your-org/coda/issues)
- Start a [Discussion](https://github.com/your-org/coda/discussions)
