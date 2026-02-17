# Contributing to Coda

Thank you for your interest in contributing to Coda! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive. We're all here to build something useful.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - macOS version
   - Node.js version
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs

### Suggesting Features

1. Check the [ROADMAP.md](ROADMAP.md) first
2. Open a discussion or issue
3. Describe the use case
4. Explain why it would be useful

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## Development Setup

### Prerequisites

- macOS 12.0+
- Node.js 18+
- Rust (via rustup)
- GitHub CLI (`gh`)

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/coda.git
cd coda

# Install dependencies
npm install
cd tools/runner && npm install && cd ../..

# Start development
npm run tauri dev  # Terminal 1
npm run runner     # Terminal 2
```

## Project Structure

```
coda/
├── src/                    # React frontend
│   └── features/           # Feature modules
├── src-tauri/              # Tauri Rust backend
│   └── src/features/       # Rust feature modules
└── tools/runner/           # Node.js runner
    └── src/                # Runner services
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Rust

- Follow Rust conventions
- Use `cargo fmt` before committing
- Run `cargo clippy` for lints

### Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(runner): add retry mechanism for failed jobs
fix(ui): correct job status color mapping
docs: update installation instructions
refactor(ai): extract prompt building logic
test: add unit tests for git service
chore: update dependencies
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

### Branch Naming

```
feat/add-retry-mechanism
fix/job-status-display
docs/update-readme
```

## Pull Request Process

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Tests**: Ensure existing tests pass
4. **Docs**: Update if needed
5. **Review**: Address feedback promptly

### PR Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No new warnings
```

## Architecture Guidelines

### Adding a New Feature

1. **Frontend**: Create feature folder in `src/features/`
   ```
   src/features/myFeature/
   ├── api/           # API calls
   ├── model/         # Types and state
   └── ui/            # React components
   ```

2. **Runner Service**: Add to `tools/runner/src/`
   ```typescript
   // my-service.ts
   export const myService = {
     async doSomething() { ... }
   }
   ```

3. **Tauri Command**: Add to `src-tauri/src/features/`
   ```rust
   #[tauri::command]
   pub async fn my_command() -> Result<(), String> { ... }
   ```

### State Management

- Use Zustand for global state
- Use React Query for server state
- Keep state close to where it's used

### API Design

- RESTful endpoints in runner
- Consistent error responses
- Type-safe with TypeScript

## Testing

### Manual Testing

1. Test happy path
2. Test error cases
3. Test edge cases
4. Test on clean install

### Future: Automated Testing

We plan to add:
- Unit tests with Vitest
- E2E tests with Playwright
- Rust tests with cargo test

## Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues/discussions first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
