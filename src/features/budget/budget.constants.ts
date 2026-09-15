export const CATEGORY_ICON_NAMES = [
  'home',
  'zap',
  'droplet',
  'wifi',
  'shield',
  'tv',
  'landmark',
  'receipt',
  'shopping-cart',
  'car',
  'party-popper',
  'utensils',
  'heart-pulse',
  'shopping-bag',
  'piggy-bank',
  'baby',
  'paw-print',
  'plane',
  'gift',
  'graduation-cap',
  'dumbbell',
  'circle',
] as const

export type CategoryIconName = (typeof CATEGORY_ICON_NAMES)[number]

export const CATEGORY_ICON_LABELS: Record<CategoryIconName, string> = {
  home: 'Maison',
  zap: 'Énergie',
  droplet: 'Eau',
  wifi: 'Internet',
  shield: 'Assurance',
  tv: 'Abonnement',
  landmark: 'Banque',
  receipt: 'Facture',
  'shopping-cart': 'Courses',
  car: 'Voiture',
  'party-popper': 'Fête',
  utensils: 'Restaurant',
  'heart-pulse': 'Santé',
  'shopping-bag': 'Shopping',
  'piggy-bank': 'Épargne',
  baby: 'Enfants',
  'paw-print': 'Animaux',
  plane: 'Voyage',
  gift: 'Cadeau',
  'graduation-cap': 'Études',
  dumbbell: 'Sport',
  circle: 'Autre',
}

export type CategoryPreset = {
  name: string
  icon: CategoryIconName
  kind: 'fixed' | 'flexible'
  /** Pre-selected during onboarding. */
  suggested: boolean
  /** Share of the remaining money proposed for flexible envelopes. */
  weight?: number
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { name: 'Loyer / Crédit immo', icon: 'home', kind: 'fixed', suggested: true },
  { name: 'Électricité & gaz', icon: 'zap', kind: 'fixed', suggested: true },
  { name: 'Eau', icon: 'droplet', kind: 'fixed', suggested: false },
  { name: 'Internet & mobile', icon: 'wifi', kind: 'fixed', suggested: true },
  { name: 'Assurances', icon: 'shield', kind: 'fixed', suggested: true },
  { name: 'Abonnements', icon: 'tv', kind: 'fixed', suggested: true },
  { name: 'Crédits', icon: 'landmark', kind: 'fixed', suggested: false },
  { name: 'Impôts', icon: 'receipt', kind: 'fixed', suggested: false },
  { name: 'Courses', icon: 'shopping-cart', kind: 'flexible', suggested: true, weight: 35 },
  { name: 'Transport', icon: 'car', kind: 'flexible', suggested: true, weight: 15 },
  { name: 'Loisirs', icon: 'party-popper', kind: 'flexible', suggested: true, weight: 12 },
  { name: 'Restaurants', icon: 'utensils', kind: 'flexible', suggested: false, weight: 8 },
  { name: 'Santé', icon: 'heart-pulse', kind: 'flexible', suggested: false, weight: 5 },
  { name: 'Shopping', icon: 'shopping-bag', kind: 'flexible', suggested: false, weight: 8 },
  { name: 'Épargne', icon: 'piggy-bank', kind: 'flexible', suggested: true, weight: 20 },
]

export const DEFAULT_FLEXIBLE_WEIGHT = 10

export const ROLE_LABELS = {
  owner: 'Propriétaire',
  editor: 'Éditeur',
  viewer: 'Lecteur',
} as const

export const ROLE_DESCRIPTIONS = {
  owner: 'Gère le budget, les membres et les invitations',
  editor: 'Ajoute des dépenses et modifie le budget',
  viewer: 'Consulte le budget sans le modifier',
} as const

export const ROLE_RANK = { viewer: 0, editor: 1, owner: 2 } as const
