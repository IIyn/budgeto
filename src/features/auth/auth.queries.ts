import { queryOptions } from '@tanstack/react-query'
import { getCurrentUserFn } from './auth.functions'

export const authQueries = {
  currentUser: () =>
    queryOptions({
      queryKey: ['auth', 'current-user'],
      queryFn: () => getCurrentUserFn(),
      staleTime: 5 * 60 * 1000,
    }),
}
