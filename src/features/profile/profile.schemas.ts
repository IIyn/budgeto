import { z } from 'zod'
import { passwordSchema } from '../auth/auth.schemas'
import { labelSchema } from '../budget/budget.schemas'

export const updateProfileSchema = z.object({ displayName: labelSchema })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis').max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
