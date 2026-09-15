import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

export const themeSchema = z.enum(['light', 'dark', 'system'])
export type Theme = z.infer<typeof themeSchema>

export const THEME_COOKIE = 'budgeto_theme'

const parseTheme = (value: string | undefined): Theme => themeSchema.catch('system').parse(value)

/** Reads the theme preference from the cookie, on the server during SSR and in the browser afterwards. */
export const getThemePreference = createIsomorphicFn()
  .server(() => parseTheme(getCookie(THEME_COOKIE)))
  .client(() => parseTheme(document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))?.[1]))

export function persistTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

/** Runs before first paint so "system" users never see a flash of the wrong theme. */
export const themeBootScript = `(function(){try{var d=document.documentElement;var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?m[1]:'system';var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',dark);d.style.colorScheme=dark?'dark':'light'}catch(e){}})()`
