import { useState } from 'react'
import { useSkillsStore } from '../model/skills.store'
import { Skill, SkillCategory, SKILL_CATEGORIES } from '../model/skills.types'

export function SkillsList() {
  const { getAllSkills, addSkill, updateSkill, deleteSkill } = useSkillsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<SkillCategory | 'all'>('all')
  const [showBuiltIn, setShowBuiltIn] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SkillCategory>('code-style')
  const [content, setContent] = useState('')

  const allSkills = getAllSkills()
  const filteredSkills = allSkills.filter((skill) => {
    if (!showBuiltIn && skill.isBuiltIn) return false
    if (filterCategory !== 'all' && skill.category !== filterCategory) return false
    return true
  })

  const resetForm = () => {
    setName('')
    setDescription('')
    setCategory('code-style')
    setContent('')
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return

    if (editingId) {
      updateSkill(editingId, { name, description, category, content })
    } else {
      addSkill({ name, description, category, content })
    }
    resetForm()
  }

  const handleEdit = (skill: Skill) => {
    if (skill.isBuiltIn) return // Can't edit built-in
    setEditingId(skill.id)
    setName(skill.name)
    setDescription(skill.description)
    setCategory(skill.category)
    setContent(skill.content)
    setIsCreating(true)
  }

  const handleDuplicate = (skill: Skill) => {
    setName(`${skill.name} (Copy)`)
    setDescription(skill.description)
    setCategory(skill.category)
    setContent(skill.content)
    setIsCreating(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills Library</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          >
            + New Skill
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as SkillCategory | 'all')}
          className="px-3 py-1.5 text-sm bg-white/10 rounded border border-white/20"
        >
          <option value="all">All Categories</option>
          {Object.entries(SKILL_CATEGORIES).map(([key, { label, icon }]) => (
            <option key={key} value={key}>
              {icon} {label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showBuiltIn}
            onChange={(e) => setShowBuiltIn(e.target.checked)}
            className="w-4 h-4"
          />
          Show built-in
        </label>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
                placeholder="e.g., TypeScript Expert"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              >
                {Object.entries(SKILL_CATEGORIES).map(([key, { label, icon }]) => (
                  <option key={key} value={key}>
                    {icon} {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
              placeholder="Brief description of this skill"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Content <span className="text-gray-500">(instructions for the AI)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none resize-none font-mono text-sm"
              placeholder="You are an expert in... Follow these practices:&#10;&#10;- Practice 1&#10;- Practice 2"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!name.trim() || !content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No skills found. {!showBuiltIn && 'Try enabling built-in skills.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white/5 rounded-lg overflow-hidden"
            >
              <div
                className="p-3 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{SKILL_CATEGORIES[skill.category].icon}</span>
                      <h3 className="font-medium">{skill.name}</h3>
                      {skill.isBuiltIn && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-600/30 text-blue-400 rounded">
                          Built-in
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{skill.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(skill)
                      }}
                      className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded"
                      title="Duplicate"
                    >
                      Copy
                    </button>
                    {!skill.isBuiltIn && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(skill)
                          }}
                          className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSkill(skill.id)
                          }}
                          className="px-2 py-1 text-sm text-red-400 hover:bg-red-600/20 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {expandedId === skill.id && (
                <div className="px-3 pb-3 border-t border-white/10">
                  <pre className="mt-3 p-3 bg-black/30 rounded text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-auto max-h-64">
                    {skill.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
