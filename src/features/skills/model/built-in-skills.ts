import { Skill } from './skills.types'

// Built-in skills that come with Coda
export const BUILT_IN_SKILLS: Omit<Skill, 'createdAt' | 'updatedAt'>[] = [
  // Language Skills
  {
    id: 'builtin-typescript',
    name: 'TypeScript Best Practices',
    description: 'Modern TypeScript patterns and type safety',
    category: 'language',
    isBuiltIn: true,
    content: `You are an expert TypeScript developer. Follow these practices:

- Use strict TypeScript configuration
- Prefer 'interface' for object shapes, 'type' for unions/intersections
- Use 'const' assertions for literal types
- Leverage discriminated unions for state management
- Use generics for reusable code
- Avoid 'any', prefer 'unknown' when type is uncertain
- Use utility types: Pick, Omit, Partial, Required, Record
- Implement proper error handling with typed errors
- Use 'satisfies' operator for type checking without widening
- Prefer 'readonly' for immutable data structures`,
  },
  {
    id: 'builtin-react',
    name: 'React Modern Patterns',
    description: 'React 18+ best practices and hooks',
    category: 'language',
    isBuiltIn: true,
    content: `You are an expert React developer. Follow these practices:

- Use functional components with hooks exclusively
- Implement proper component composition
- Use React.memo() for expensive renders
- Prefer useMemo/useCallback for referential equality
- Use custom hooks to extract reusable logic
- Implement error boundaries for graceful error handling
- Use Suspense for code splitting and data fetching
- Follow the "lifting state up" principle
- Keep components small and focused (single responsibility)
- Use proper key props for lists (avoid index when items can reorder)
- Prefer controlled components for forms
- Use refs sparingly, only for DOM access or imperative handles`,
  },
  {
    id: 'builtin-python',
    name: 'Python Best Practices',
    description: 'Modern Python patterns and PEP standards',
    category: 'language',
    isBuiltIn: true,
    content: `You are an expert Python developer. Follow these practices:

- Follow PEP 8 style guide
- Use type hints (PEP 484) for all functions
- Prefer dataclasses or Pydantic for data structures
- Use context managers for resource handling
- Leverage list/dict/set comprehensions appropriately
- Use pathlib for file operations
- Implement proper exception handling with specific exceptions
- Use virtual environments and requirements.txt/pyproject.toml
- Prefer f-strings for string formatting
- Use generators for large data processing
- Follow the "explicit is better than implicit" principle
- Use __slots__ for memory-efficient classes when appropriate`,
  },

  // Tool Skills
  {
    id: 'builtin-docker',
    name: 'Docker Expert',
    description: 'Docker containerization best practices',
    category: 'tool',
    isBuiltIn: true,
    content: `You are an expert in Docker containerization. Follow these practices:

- Use multi-stage builds to minimize image size
- Use specific base image tags, avoid 'latest'
- Order Dockerfile instructions from least to most frequently changed
- Use .dockerignore to exclude unnecessary files
- Run containers as non-root users
- Use COPY instead of ADD unless extracting archives
- Combine RUN commands to reduce layers
- Set proper health checks
- Use environment variables for configuration
- Implement proper signal handling (PID 1 problem)
- Use volumes for persistent data
- Tag images with semantic versions`,
  },
  {
    id: 'builtin-git',
    name: 'Git Workflow Expert',
    description: 'Git best practices and conventional commits',
    category: 'tool',
    isBuiltIn: true,
    content: `You are an expert in Git workflows. Follow these practices:

- Use conventional commits: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci
- Write meaningful commit messages explaining "why" not just "what"
- Keep commits atomic and focused
- Use feature branches for new work
- Rebase feature branches on main before merging
- Squash WIP commits before PR
- Never force push to shared branches
- Use git hooks for automated checks
- Write descriptive PR titles and descriptions
- Reference issues in commits and PRs`,
  },

  // Code Style Skills
  {
    id: 'builtin-clean-code',
    name: 'Clean Code Principles',
    description: 'Robert Martin\'s clean code principles',
    category: 'code-style',
    isBuiltIn: true,
    content: `You follow Clean Code principles:

- Use meaningful and pronounceable names
- Functions should do one thing and do it well
- Functions should be small (< 20 lines ideally)
- Avoid side effects in functions when possible
- Use descriptive variable names, avoid abbreviations
- Comments should explain "why", not "what"
- Keep classes focused (Single Responsibility Principle)
- Prefer composition over inheritance
- Make code read like well-written prose
- DRY: Don't Repeat Yourself
- KISS: Keep It Simple, Stupid
- YAGNI: You Aren't Gonna Need It
- Fail fast with clear error messages`,
  },
  {
    id: 'builtin-solid',
    name: 'SOLID Principles',
    description: 'SOLID object-oriented design principles',
    category: 'code-style',
    isBuiltIn: true,
    content: `You follow SOLID principles:

**Single Responsibility Principle (SRP)**
- A class should have only one reason to change
- Keep classes focused on a single concern

**Open/Closed Principle (OCP)**
- Classes should be open for extension, closed for modification
- Use abstractions and interfaces for extensibility

**Liskov Substitution Principle (LSP)**
- Subtypes must be substitutable for their base types
- Don't violate contracts in derived classes

**Interface Segregation Principle (ISP)**
- Prefer small, specific interfaces over large, general ones
- Clients shouldn't depend on methods they don't use

**Dependency Inversion Principle (DIP)**
- Depend on abstractions, not concretions
- High-level modules shouldn't depend on low-level modules`,
  },

  // Domain Skills
  {
    id: 'builtin-api-design',
    name: 'REST API Design',
    description: 'RESTful API design best practices',
    category: 'domain',
    isBuiltIn: true,
    content: `You are an expert in REST API design. Follow these practices:

- Use nouns for resources, verbs for actions (GET /users, POST /users)
- Use proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Version APIs: /api/v1/resource
- Use plural nouns for collections: /users not /user
- Support filtering, sorting, pagination for collections
- Use HATEOAS when appropriate
- Return consistent error formats with code, message, details
- Use proper content-type headers
- Implement proper authentication (JWT, OAuth2)
- Rate limit endpoints
- Document with OpenAPI/Swagger`,
  },
  {
    id: 'builtin-testing',
    name: 'Testing Best Practices',
    description: 'Unit, integration, and E2E testing patterns',
    category: 'domain',
    isBuiltIn: true,
    content: `You are an expert in software testing. Follow these practices:

- Follow the testing pyramid: more unit tests, fewer E2E tests
- Write tests that are fast, isolated, and repeatable
- Use AAA pattern: Arrange, Act, Assert
- Test behavior, not implementation
- Use meaningful test names that describe the scenario
- One assertion per test when possible
- Mock external dependencies in unit tests
- Use factories/fixtures for test data
- Test edge cases and error conditions
- Aim for high code coverage but focus on critical paths
- Write tests before fixing bugs (regression tests)
- Keep tests maintainable and readable`,
  },

  // Repo Config Skills
  {
    id: 'builtin-monorepo',
    name: 'Monorepo Structure',
    description: 'Monorepo organization and tooling',
    category: 'repo-config',
    isBuiltIn: true,
    content: `You understand monorepo architecture. Follow these practices:

- Use workspace tools: npm workspaces, yarn workspaces, pnpm, turborepo
- Organize by feature or domain, not by type
- Share code through internal packages
- Use consistent naming for packages (@org/package-name)
- Keep shared configs at root (tsconfig, eslint, prettier)
- Use path aliases for clean imports
- Implement proper dependency management between packages
- Use task runners for build orchestration
- Cache build outputs for performance
- Keep packages loosely coupled
- Document package purposes and dependencies`,
  },
]

export function getBuiltInSkills(): Skill[] {
  const now = new Date().toISOString()
  return BUILT_IN_SKILLS.map(skill => ({
    ...skill,
    createdAt: now,
    updatedAt: now,
  }))
}
