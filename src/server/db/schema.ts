import { relations } from 'drizzle-orm'
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/** Amounts are always stored in cents to avoid floating point errors. */
const cents = (name: string) => integer(name).notNull().default(0)

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const memberRole = pgEnum('member_role', ['owner', 'editor', 'viewer'])
export const categoryKind = pgEnum('category_kind', ['fixed', 'flexible'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
})

export const sessions = pgTable(
  'sessions',
  {
    /** SHA-256 of the token stored in the cookie: a leaked DB row cannot be replayed. */
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('EUR'),
  ...timestamps,
})

export const budgetMembers = pgTable(
  'budget_members',
  {
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('editor'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.budgetId, t.userId] }), index('members_user_idx').on(t.userId)],
)

/** Recurring monthly resources (salary, allowances...). */
export const incomes = pgTable(
  'incomes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    amount: cents('amount'),
    ...timestamps,
  },
  (t) => [index('incomes_budget_idx').on(t.budgetId)],
)

/**
 * A budget line. `fixed` lines (rent, bills, insurance) are deducted every month automatically.
 * `flexible` lines are envelopes (food, leisure) consumed by the expenses users add.
 */
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    icon: text('icon').notNull().default('circle'),
    kind: categoryKind('kind').notNull(),
    monthlyAmount: cents('monthly_amount'),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('categories_budget_idx').on(t.budgetId)],
)

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    label: text('label').notNull(),
    /** Optional icon chosen for this expense; when null the category icon is shown. */
    icon: text('icon'),
    amount: cents('amount'),
    spentOn: date('spent_on', { mode: 'string' }).notNull(),
    ...timestamps,
  },
  (t) => [index('expenses_budget_date_idx').on(t.budgetId, t.spentOn)],
)

export const invitations = pgTable('invitations', {
  /** SHA-256 of the token shared in the link. */
  id: text('id').primaryKey(),
  budgetId: uuid('budget_id')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  role: memberRole('role').notNull().default('editor'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(budgetMembers),
}))

export const budgetsRelations = relations(budgets, ({ many }) => ({
  members: many(budgetMembers),
  incomes: many(incomes),
  categories: many(categories),
  expenses: many(expenses),
}))

export const budgetMembersRelations = relations(budgetMembers, ({ one }) => ({
  budget: one(budgets, { fields: [budgetMembers.budgetId], references: [budgets.id] }),
  user: one(users, { fields: [budgetMembers.userId], references: [users.id] }),
}))

export const incomesRelations = relations(incomes, ({ one }) => ({
  budget: one(budgets, { fields: [incomes.budgetId], references: [budgets.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  budget: one(budgets, { fields: [categories.budgetId], references: [budgets.id] }),
  expenses: many(expenses),
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  budget: one(budgets, { fields: [expenses.budgetId], references: [budgets.id] }),
  category: one(categories, { fields: [expenses.categoryId], references: [categories.id] }),
  author: one(users, { fields: [expenses.createdBy], references: [users.id] }),
}))

export type MemberRole = (typeof memberRole.enumValues)[number]
export type CategoryKind = (typeof categoryKind.enumValues)[number]
