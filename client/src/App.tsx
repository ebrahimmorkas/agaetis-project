import { ArrowRight, Mail, Plus, Trash2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'

function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold text-primary-600">Agaetis</h1>

      <div className="flex flex-wrap gap-3">
        <Button>Save</Button>
        <Button icon={<Plus size={16} />}>Add item</Button>
        <Button variant="outline" icon={<ArrowRight size={16} />} iconPosition="right">
          Next
        </Button>
        <Button variant="danger" icon={<Trash2 size={16} />} aria-label="Delete" />
        <Button variant="secondary" loading>
          Saving
        </Button>
      </div>

      <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={16} />} />
    </main>
  )
}

export default App
