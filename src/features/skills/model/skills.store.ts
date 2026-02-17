import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Skill, CreateSkillInput, RepoSkillAssignment } from './skills.types'
import { getBuiltInSkills } from './built-in-skills'
import { v4 as uuid } from 'uuid'

interface SkillsState {
  skills: Skill[]
  repoAssignments: RepoSkillAssignment[]
  
  // Skill CRUD
  addSkill: (input: CreateSkillInput) => Skill
  updateSkill: (id: string, updates: Partial<CreateSkillInput>) => void
  deleteSkill: (id: string) => void
  getSkill: (id: string) => Skill | undefined
  
  // Repo assignments
  assignSkillToRepo: (repoPath: string, skillId: string) => void
  unassignSkillFromRepo: (repoPath: string, skillId: string) => void
  getSkillsForRepo: (repoPath: string) => Skill[]
  getRepoAssignment: (repoPath: string) => RepoSkillAssignment | undefined
  
  // Utilities
  getAllSkills: () => Skill[]
  getBuiltInSkills: () => Skill[]
  getCustomSkills: () => Skill[]
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      skills: [],
      repoAssignments: [],

      addSkill: (input) => {
        const now = new Date().toISOString()
        const skill: Skill = {
          id: uuid(),
          name: input.name,
          description: input.description,
          category: input.category,
          content: input.content,
          isBuiltIn: false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ skills: [...state.skills, skill] }))
        return skill
      },

      updateSkill: (id, updates) => {
        set((state) => ({
          skills: state.skills.map((skill) =>
            skill.id === id && !skill.isBuiltIn
              ? { ...skill, ...updates, updatedAt: new Date().toISOString() }
              : skill
          ),
        }))
      },

      deleteSkill: (id) => {
        const skill = get().skills.find(s => s.id === id)
        if (skill?.isBuiltIn) return // Can't delete built-in skills
        
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
          // Also remove from all repo assignments
          repoAssignments: state.repoAssignments.map((ra) => ({
            ...ra,
            skillIds: ra.skillIds.filter((sid) => sid !== id),
          })),
        }))
      },

      getSkill: (id) => {
        // Check custom skills first, then built-in
        const customSkill = get().skills.find((s) => s.id === id)
        if (customSkill) return customSkill
        return getBuiltInSkills().find((s) => s.id === id)
      },

      assignSkillToRepo: (repoPath, skillId) => {
        set((state) => {
          const existing = state.repoAssignments.find((ra) => ra.repoPath === repoPath)
          if (existing) {
            if (existing.skillIds.includes(skillId)) return state
            return {
              repoAssignments: state.repoAssignments.map((ra) =>
                ra.repoPath === repoPath
                  ? { ...ra, skillIds: [...ra.skillIds, skillId] }
                  : ra
              ),
            }
          }
          return {
            repoAssignments: [
              ...state.repoAssignments,
              { repoPath, skillIds: [skillId] },
            ],
          }
        })
      },

      unassignSkillFromRepo: (repoPath, skillId) => {
        set((state) => ({
          repoAssignments: state.repoAssignments.map((ra) =>
            ra.repoPath === repoPath
              ? { ...ra, skillIds: ra.skillIds.filter((id) => id !== skillId) }
              : ra
          ),
        }))
      },

      getSkillsForRepo: (repoPath) => {
        const assignment = get().repoAssignments.find((ra) => ra.repoPath === repoPath)
        if (!assignment) return []
        
        const allSkills = get().getAllSkills()
        return assignment.skillIds
          .map((id) => allSkills.find((s) => s.id === id))
          .filter((s): s is Skill => s !== undefined)
      },

      getRepoAssignment: (repoPath) => {
        return get().repoAssignments.find((ra) => ra.repoPath === repoPath)
      },

      getAllSkills: () => {
        return [...getBuiltInSkills(), ...get().skills]
      },

      getBuiltInSkills: () => {
        return getBuiltInSkills()
      },

      getCustomSkills: () => {
        return get().skills
      },
    }),
    {
      name: 'mac-agent-skills',
    }
  )
)
