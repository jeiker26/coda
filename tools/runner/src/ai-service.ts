import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { AIResponse, SkillContext } from './types.js'
import * as fs from 'fs/promises'
import * as path from 'path'

const BASE_SYSTEM_PROMPT = `You are an expert software engineer. You will receive a task description and information about a codebase.
Your job is to generate code patches to complete the task.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "patches": [
    {
      "filePath": "relative/path/to/file.ts",
      "content": "full file content here",
      "operation": "create" | "modify" | "delete"
    }
  ],
  "explanation": "Brief explanation of changes",
  "testCommands": ["npm test", "other commands to verify"]
}

Rules:
- Always provide the COMPLETE file content for modifications, not just the changed parts
- Use relative paths from the repository root
- Keep changes minimal and focused on the task
- Follow existing code style and patterns
- Add appropriate error handling
- Include test commands if applicable`

function buildSystemPrompt(skills?: SkillContext[]): string {
  if (!skills || skills.length === 0) {
    return BASE_SYSTEM_PROMPT
  }

  const skillsSection = skills
    .map(skill => `## ${skill.name}\n${skill.content}`)
    .join('\n\n')

  return `${BASE_SYSTEM_PROMPT}

---

# Applied Skills

The following skills and guidelines must be followed:

${skillsSection}`
}

export class AIService {
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private anthropicBaseUrl?: string

  constructor(
    openaiApiKey?: string,
    openaiBaseUrl?: string,
    anthropicApiKey?: string,
    anthropicBaseUrl?: string
  ) {
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: openaiBaseUrl || 'https://api.openai.com/v1',
      })
    }
    if (anthropicApiKey) {
      this.anthropicBaseUrl = anthropicBaseUrl
      this.anthropic = new Anthropic({
        apiKey: anthropicApiKey,
        baseURL: anthropicBaseUrl || undefined,
      })
    }
  }

  async generateCode(
    task: string,
    repoPath: string,
    provider: 'openai' | 'anthropic' = 'anthropic',
    skills?: SkillContext[]
  ): Promise<AIResponse> {
    // Gather context from the repo
    const context = await this.gatherRepoContext(repoPath)
    
    const userPrompt = `
Task: ${task}

Repository context:
${context}

Generate the necessary code patches to complete this task.`

    const systemPrompt = buildSystemPrompt(skills)

    if (provider === 'anthropic' && this.anthropic) {
      return this.generateWithAnthropic(userPrompt, systemPrompt)
    } else if (provider === 'openai' && this.openai) {
      return this.generateWithOpenAI(userPrompt, systemPrompt)
    } else {
      // Try anthropic first, then openai
      if (this.anthropic) {
        return this.generateWithAnthropic(userPrompt, systemPrompt)
      } else if (this.openai) {
        return this.generateWithOpenAI(userPrompt, systemPrompt)
      }
      throw new Error('No AI provider configured')
    }
  }

  private async generateWithAnthropic(userPrompt: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not configured')

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic')
    }

    return this.parseAIResponse(content.text)
  }

  private async generateWithOpenAI(userPrompt: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not configured')

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    return this.parseAIResponse(content)
  }

  private parseAIResponse(text: string): AIResponse {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }

    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        patches: parsed.patches || [],
        explanation: parsed.explanation || '',
        testCommands: parsed.testCommands || [],
      }
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${e}`)
    }
  }

  private async gatherRepoContext(repoPath: string): Promise<string> {
    const context: string[] = []
    
    // Get package.json if exists
    try {
      const pkgPath = path.join(repoPath, 'package.json')
      const pkg = await fs.readFile(pkgPath, 'utf-8')
      context.push(`package.json:\n${pkg}\n`)
    } catch {}

    // Get README if exists
    try {
      const readmePath = path.join(repoPath, 'README.md')
      const readme = await fs.readFile(readmePath, 'utf-8')
      context.push(`README.md:\n${readme.slice(0, 2000)}\n`)
    } catch {}

    // List main directories
    try {
      const entries = await fs.readdir(repoPath, { withFileTypes: true })
      const dirs = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => e.name)
      context.push(`Directories: ${dirs.join(', ')}\n`)
    } catch {}

    // Get tsconfig if exists
    try {
      const tsconfigPath = path.join(repoPath, 'tsconfig.json')
      const tsconfig = await fs.readFile(tsconfigPath, 'utf-8')
      context.push(`tsconfig.json:\n${tsconfig}\n`)
    } catch {}

    // Get first few source files
    try {
      const srcFiles = await this.getSourceFiles(repoPath, 5)
      for (const file of srcFiles) {
        const content = await fs.readFile(file, 'utf-8')
        const relativePath = path.relative(repoPath, file)
        context.push(`File: ${relativePath}\n${content.slice(0, 1500)}\n`)
      }
    } catch {}

    return context.join('\n---\n')
  }

  private async getSourceFiles(dir: string, limit: number): Promise<string[]> {
    const files: string[] = []
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go']

    const walk = async (currentDir: string) => {
      if (files.length >= limit) return
      
      const entries = await fs.readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        if (files.length >= limit) break
        
        const fullPath = path.join(currentDir, entry.name)
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
            await walk(fullPath)
          }
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }

    await walk(dir)
    return files
  }
}
