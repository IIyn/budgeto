import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { monthRange } from '@/lib/month'
import { requireBudgetRole } from '@/server/budget/access.server'
import { db } from '@/server/db/client.server'
import { categories, expenses, users } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { deleteItemSchema, listExpensesSchema, saveExpenseSchema } from '../budget/budget.schemas'

export const listExpensesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(listExpensesSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId)
    const { from, to } = monthRange(data.month)

    return db
      .select({
        id: expenses.id,
        kind: expenses.kind,
        label: expenses.label,
        icon: expenses.icon,
        amount: expenses.amount,
        spentOn: expenses.spentOn,
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        authorName: users.displayName,
      })
      .from(expenses)
      .leftJoin(categories, eq(categories.id, expenses.categoryId))
      .leftJoin(users, eq(users.id, expenses.createdBy))
      .where(
        and(
          eq(expenses.budgetId, data.budgetId),
          gte(expenses.spentOn, from),
          lte(expenses.spentOn, to),
          data.categoryId ? eq(expenses.categoryId, data.categoryId) : undefined,
        ),
      )
      .orderBy(desc(expenses.spentOn), desc(expenses.createdAt))
      .limit(data.limit ?? 500)
  })

export const saveExpenseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(saveExpenseSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    // Incomes are not filed under an envelope: they add to the whole month.
    const categoryId = data.kind === 'income' ? null : data.categoryId
    await assertCategoryInBudget(categoryId, data.budgetId)

    const values = {
      kind: data.kind,
      label: data.label,
      icon: data.icon,
      amount: data.amount,
      categoryId,
      spentOn: data.spentOn,
    }

    if (data.id) {
      await db
        .update(expenses)
        .set(values)
        .where(and(eq(expenses.id, data.id), eq(expenses.budgetId, data.budgetId)))
      return { id: data.id }
    }

    const [created] = await db
      .insert(expenses)
      .values({ ...values, budgetId: data.budgetId, createdBy: context.user.id })
      .returning({ id: expenses.id })
    return { id: created!.id }
  })

export const deleteExpenseFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteItemSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    await db.delete(expenses).where(and(eq(expenses.id, data.id), eq(expenses.budgetId, data.budgetId)))
  })

async function assertCategoryInBudget(categoryId: string | null, budgetId: string) {
  if (!categoryId) return
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.budgetId, budgetId)),
    columns: { id: true },
  })
  if (!category) throw new Error('Catégorie introuvable')
}
