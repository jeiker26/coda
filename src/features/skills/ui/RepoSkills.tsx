import { useSkillsStore } from '../model/skills.store'
import { SKILL_CATEGORIES } from '../model/skills.types'

interface RepoSkillsProps {
  repoPath: string
  repoName: string
}

export function RepoSkills({ repoPath, repoName }: RepoSkillsProps) {
  const { 
    getAllSkills, 
    getSkillsForRepo, 
    assignSkillToRepo, 
    unassignSkillFromRepo 
  } = useSkillsStore()

  const allSkills = getAllSkills()
  const assignedSkills = getSkillsForRepo(repoPath)
  const assignedIds = new Set(assignedSkills.map(s => s.id))

  // Group skills by category
  const skillsByCategory = allSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof allSkills>)

  const toggleSkill = (skillId: string) => {
    if (assignedIds.has(skillId)) {
      unassignSkillFromRepo(repoPath, skillId)
    } else {
      assignSkillToRepo(repoPath, skillId)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">
          Skills for {repoName}
        </h4>
        <span className="text-xs text-gray-500">
          {assignedSkills.length} assigned
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto">
        {Object.entries(SKILL_CATEGORIES).map(([category, { label, icon }]) => {
          const skills = skillsByCategory[category] || []
          if (skills.length === 0) return null

          return (
            <div key={category}>
              <div className="text-xs text-gray-500 mb-1">
                {icon} {label}
              </div>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      assignedIds.has(skill.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                    title={skill.description}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
