import {
  Baby,
  Car,
  Circle,
  Droplet,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  type LucideIcon,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tv,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryIconName } from '../budget.constants'

export const CATEGORY_ICONS: Record<CategoryIconName, LucideIcon> = {
  home: Home,
  zap: Zap,
  droplet: Droplet,
  wifi: Wifi,
  shield: Shield,
  tv: Tv,
  landmark: Landmark,
  receipt: Receipt,
  'shopping-cart': ShoppingCart,
  car: Car,
  'party-popper': PartyPopper,
  utensils: Utensils,
  'heart-pulse': HeartPulse,
  'shopping-bag': ShoppingBag,
  'piggy-bank': PiggyBank,
  baby: Baby,
  'paw-print': PawPrint,
  plane: Plane,
  gift: Gift,
  'graduation-cap': GraduationCap,
  dumbbell: Dumbbell,
  circle: Circle,
}

const TONES = {
  fixed: 'bg-chart-5/15 text-chart-5',
  flexible: 'bg-primary/12 text-primary',
  neutral: 'bg-muted text-muted-foreground',
} as const

type CategoryIconProps = {
  icon: string | null | undefined
  tone?: keyof typeof TONES
  className?: string
}

export function CategoryIcon({ icon, tone = 'flexible', className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[icon as CategoryIconName] ?? Circle
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', TONES[tone], className)}>
      <Icon className="size-5" />
    </span>
  )
}
