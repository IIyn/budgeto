import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/features/budget/budget.constants'
import { type MemberRole, memberRoleSchema } from '@/features/budget/budget.schemas'

type RoleSelectProps = {
  value: MemberRole
  onChange: (role: MemberRole) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function RoleSelect({ value, onChange, disabled, className, label = 'Rôle' }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(memberRoleSchema.parse(next))} disabled={disabled}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {memberRoleSchema.options.map((role) => (
          <SelectItem key={role} value={role} title={ROLE_DESCRIPTIONS[role]}>
            {ROLE_LABELS[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
