import { execa } from 'execa'
import * as fs from 'fs/promises'
import * as path from 'path'
import { CodePatch } from './types.js'

export class PatchService {
  constructor(private repoPath: string) {}

  async applyPatches(patches: CodePatch[]): Promise<void> {
    for (const patch of patches) {
      const fullPath = path.join(this.repoPath, patch.filePath)
      
      switch (patch.operation) {
        case 'create':
        case 'modify':
          // Ensure directory exists
          await fs.mkdir(path.dirname(fullPath), { recursive: true })
          await fs.writeFile(fullPath, patch.content, 'utf-8')
          break
        case 'delete':
          try {
            await fs.unlink(fullPath)
          } catch (e) {
            // File might not exist
          }
          break
      }
    }
  }

  async runTests(commands: string[]): Promise<{ success: boolean; output: string }> {
    const outputs: string[] = []
    
    for (const command of commands) {
      try {
        const [cmd, ...args] = command.split(' ')
        const result = await execa(cmd, args, {
          cwd: this.repoPath,
          timeout: 300000, // 5 minutes
          reject: false,
        })
        
        outputs.push(`$ ${command}`)
        outputs.push(result.stdout)
        if (result.stderr) outputs.push(result.stderr)
        
        if (result.exitCode !== 0) {
          return {
            success: false,
            output: outputs.join('\n'),
          }
        }
      } catch (e: any) {
        outputs.push(`$ ${command}`)
        outputs.push(`Error: ${e.message}`)
        return {
          success: false,
          output: outputs.join('\n'),
        }
      }
    }

    return {
      success: true,
      output: outputs.join('\n'),
    }
  }

  async validatePatches(patches: CodePatch[], maxFiles: number, maxDiffSize: number): Promise<void> {
    if (patches.length > maxFiles) {
      throw new Error(`Too many files changed: ${patches.length} > ${maxFiles}`)
    }

    const totalSize = patches.reduce((acc, p) => acc + (p.content?.length || 0), 0)
    if (totalSize > maxDiffSize * 100) { // Rough estimate
      throw new Error(`Diff too large: ${totalSize} characters`)
    }
  }
}
