import { useState } from 'react'
import { TaskComposer } from '@features/taskComposer'
import { JobsList } from '@features/jobs'
import { TasksList } from '@features/tasks'
import { SkillsList } from '@features/skills'
import { Settings } from '@features/settings'

type Tab = 'tasks' | 'prompt' | 'jobs' | 'skills' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')

  return (
    <div className="min-h-screen bg-menubar-bg text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-menubar-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Coda" className="w-6 h-6" />
          <h1 className="text-lg font-semibold">Coda</h1>
        </div>
        <nav className="flex gap-1">
          {(['tasks', 'prompt', 'jobs', 'skills', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-4">
        {activeTab === 'tasks' && <TasksList />}
        {activeTab === 'prompt' && <TaskComposer />}
        {activeTab === 'jobs' && <JobsList />}
        {activeTab === 'skills' && <SkillsList />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
