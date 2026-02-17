import { useState } from 'react'
import { useSnippetsStore } from '../model/snippets.store'

export function SnippetsList() {
  const { snippets, addSnippet, updateSnippet, removeSnippet } = useSnippetsStore()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newTemplate, setNewTemplate] = useState('')

  const handleAdd = () => {
    if (newName && newTemplate) {
      addSnippet({ name: newName, template: newTemplate })
      setNewName('')
      setNewTemplate('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-2">
        Variables: {'{pr_url}'}, {'{task}'}, {'{repo}'}, {'{branch}'}, {'{status}'}
      </div>

      {/* Add new snippet */}
      <div className="bg-white/5 rounded-lg p-3 space-y-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none"
          placeholder="Snippet name..."
        />
        <textarea
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 focus:border-blue-500 outline-none resize-none"
          placeholder="Template text with {variables}..."
          rows={3}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
        >
          Add Snippet
        </button>
      </div>

      {/* Snippets list */}
      <div className="space-y-2">
        {snippets.map((snippet) => (
          <div key={snippet.id} className="bg-white/5 rounded-lg p-3">
            {isEditing === snippet.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={snippet.name}
                  onChange={(e) => updateSnippet(snippet.id, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 outline-none"
                />
                <textarea
                  value={snippet.template}
                  onChange={(e) => updateSnippet(snippet.id, { template: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 rounded border border-white/20 outline-none resize-none"
                  rows={3}
                />
                <button
                  onClick={() => setIsEditing(null)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{snippet.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(snippet.template)}
                      className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => setIsEditing(snippet.id)}
                      className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSnippet(snippet.id)}
                      className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <pre className="text-sm text-gray-400 whitespace-pre-wrap">{snippet.template}</pre>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
