import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AddCategoryInputProps = {
  placeholder: string
  onAdd: (name: string) => void
}

export function AddCategoryInput({ placeholder, onAdd }: AddCategoryInputProps) {
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={60}
        className="h-11"
      />
      <Button type="submit" variant="outline" size="icon-lg" disabled={!name.trim()} aria-label="Ajouter">
        <Plus />
      </Button>
    </form>
  )
}
