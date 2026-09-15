import { z } from 'zod'

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, '3 caractères minimum')
  .max(32, '32 caractères maximum')
  .regex(/^[a-z0-9._-]+$/, 'Lettres, chiffres, point, tiret ou underscore uniquement')

export const passwordSchema = z.string().min(8, '8 caractères minimum').max(128, '128 caractères maximum')

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Mot de passe requis').max(128),
})

export const signupSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

/** Only same-origin paths are accepted, to prevent open redirects after login. */
export const redirectSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
})

export const UNAUTHORIZED_MESSAGE = 'UNAUTHORIZED'

export type SessionUser = {
  id: string
  username: string
  displayName: string
}
