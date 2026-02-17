export interface Snippet {
  id: string
  name: string
  template: string
  createdAt: string
}

// Template variables: {pr_url}, {task}, {repo}, {branch}, {status}
export const defaultSnippets: Snippet[] = [
  {
    id: '1',
    name: 'PR Ready',
    template: 'PR ready for review: {pr_url}\nTask: {task}\nRepo: {repo}',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Job Complete',
    template: 'Agent completed: {task}\nStatus: {status}\nBranch: {branch}',
    createdAt: new Date().toISOString(),
  },
]
