import { useQueryClient } from '@tanstack/react-query'
import { budgetKeys } from './budget.queries'

/** Refreshes every query of a budget after a mutation (overview, expenses, settings...). */
export function useInvalidateBudget(budgetId: string) {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: budgetKeys.all(budgetId) }),
      queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    ])
}
