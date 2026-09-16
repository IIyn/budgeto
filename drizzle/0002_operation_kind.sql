CREATE TYPE "public"."operation_kind" AS ENUM('expense', 'income');--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "kind" "operation_kind" DEFAULT 'expense' NOT NULL;