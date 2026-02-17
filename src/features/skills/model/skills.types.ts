export type SkillCategory = 
  | 'repo-config'    // Repository-specific conventions
  | 'code-style'     // Code patterns, architecture, naming
  | 'domain'         // Business domain knowledge
  | 'tool'           // Tools and platforms
  | 'language'       // Language-specific best practices

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  content: string           // The actual skill instructions/knowledge
  isBuiltIn: boolean        // System-provided vs user-created
  createdAt: string
  updatedAt: string
}

export interface RepoSkillAssignment {
  repoPath: string
  skillIds: string[]
}

export interface CreateSkillInput {
  name: string
  description: string
  category: SkillCategory
  content: string
}

// Category metadata for UI
export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; description: string; icon: string }> = {
  'repo-config': {
    label: 'Repo Config',
    description: 'Repository conventions, linting, testing, CI/CD',
    icon: '⚙️',
  },
  'code-style': {
    label: 'Code Style',
    description: 'Architecture patterns, naming conventions, code organization',
    icon: '📐',
  },
  'domain': {
    label: 'Domain',
    description: 'Business logic, industry knowledge, domain-specific rules',
    icon: '🏢',
  },
  'tool': {
    label: 'Tools',
    description: 'Docker, Kubernetes, AWS, databases, etc.',
    icon: '🔧',
  },
  'language': {
    label: 'Language',
    description: 'Language-specific patterns and best practices',
    icon: '💻',
  },
}
