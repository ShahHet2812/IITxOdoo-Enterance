import { ExpenseForm } from "@/components/expenses/expense-form"

export default function SubmitExpensePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit Expense</h1>
        <p className="text-muted-foreground">Create a new expense claim for approval</p>
      </div>

      <ExpenseForm />
    </div>
  )
}
