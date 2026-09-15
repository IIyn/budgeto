import { createStore } from '@tanstack/react-store'
import { CATEGORY_PRESETS, type CategoryIconName } from '../budget/budget.constants'
import { suggestAllocation } from '../budget/budget.logic'
import type { CategoryKind } from '../budget/budget.schemas'

export type DraftIncome = { id: string; label: string; amount: number }

export type DraftCategory = {
  id: string
  name: string
  icon: CategoryIconName
  kind: CategoryKind
  selected: boolean
  /** Fixed charge amount, or the envelope allocation chosen at the split step (cents). */
  monthlyAmount: number
  /** Optional spending estimate typed for an envelope, used to propose the split (cents). */
  estimate: number
  weight?: number
}

export type OnboardingDraft = {
  version: 1
  displayName: string
  budgetName: string
  incomes: DraftIncome[]
  categories: DraftCategory[]
  /** Becomes true once a split has been proposed, so later visits keep the user's adjustments. */
  splitProposed: boolean
}

const STORAGE_KEY = 'budgeto:onboarding-draft'

// crypto.randomUUID is unavailable over plain HTTP (e.g. the Raspberry Pi on the LAN).
const localId = () => Math.random().toString(36).slice(2, 10)

function initialDraft(): OnboardingDraft {
  return {
    version: 1,
    displayName: '',
    budgetName: 'Notre budget',
    incomes: [{ id: localId(), label: 'Salaire', amount: 0 }],
    categories: CATEGORY_PRESETS.map((preset) => ({
      id: localId(),
      name: preset.name,
      icon: preset.icon,
      kind: preset.kind,
      selected: preset.suggested,
      monthlyAmount: 0,
      estimate: 0,
      weight: preset.weight,
    })),
    splitProposed: false,
  }
}

function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return initialDraft()
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as OnboardingDraft | null
    return saved?.version === 1 ? saved : initialDraft()
  } catch {
    return initialDraft()
  }
}

export const onboardingStore = createStore(loadDraft(), ({ setState, get }) => {
  const updateIncome = (id: string, patch: Partial<DraftIncome>) =>
    setState((draft) => ({
      ...draft,
      incomes: draft.incomes.map((income) => (income.id === id ? { ...income, ...patch } : income)),
    }))

  const updateCategory = (id: string, patch: Partial<DraftCategory>) =>
    setState((draft) => ({
      ...draft,
      categories: draft.categories.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    }))

  return {
    update: (patch: Partial<Pick<OnboardingDraft, 'displayName' | 'budgetName'>>) =>
      setState((draft) => ({ ...draft, ...patch })),

    addIncome: () =>
      setState((draft) => ({ ...draft, incomes: [...draft.incomes, { id: localId(), label: '', amount: 0 }] })),
    updateIncome,
    removeIncome: (id: string) =>
      setState((draft) => ({ ...draft, incomes: draft.incomes.filter((income) => income.id !== id) })),

    updateCategory,
    toggleCategory: (id: string) => {
      const category = get().categories.find((c) => c.id === id)
      if (category) updateCategory(id, { selected: !category.selected })
    },
    addCategory: (kind: CategoryKind, name: string) =>
      setState((draft) => ({
        ...draft,
        categories: [
          ...draft.categories,
          { id: localId(), name, icon: 'circle', kind, selected: true, monthlyAmount: 0, estimate: 0 },
        ],
      })),

    proposeSplit: () =>
      setState((draft) => {
        const { afterFixed } = draftTotals(draft)
        const envelopes = suggestAllocation(
          draft.categories.filter((c) => c.kind === 'flexible' && c.selected),
          afterFixed,
        )
        const allocations = new Map(envelopes.map((e) => [e.id, e.monthlyAmount]))
        return {
          ...draft,
          splitProposed: true,
          categories: draft.categories.map((c) => ({ ...c, monthlyAmount: allocations.get(c.id) ?? c.monthlyAmount })),
        }
      }),

    reset: () => setState(() => initialDraft()),
  }
})

if (typeof window !== 'undefined') {
  onboardingStore.subscribe((draft) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // Private browsing or full storage: the wizard still works, it just won't survive a reload.
    }
  })
}

export function draftTotals(draft: OnboardingDraft) {
  const income = draft.incomes.reduce((sum, i) => sum + i.amount, 0)
  const selected = draft.categories.filter((c) => c.selected)
  const fixed = selected.filter((c) => c.kind === 'fixed').reduce((sum, c) => sum + c.monthlyAmount, 0)
  const allocated = selected.filter((c) => c.kind === 'flexible').reduce((sum, c) => sum + c.monthlyAmount, 0)
  return { income, fixed, allocated, afterFixed: income - fixed, unallocated: income - fixed - allocated }
}
