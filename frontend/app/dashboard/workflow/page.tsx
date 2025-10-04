"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApprovalFlow } from "@/components/workflow/approval-flow"
import { WorkflowStats } from "@/components/workflow/workflow-stats"
import { GitBranch, Loader2 } from "lucide-react"
import type { Expense } from "@/lib/types"
import api from "@/lib/api"

export default function WorkflowPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/expenses');
        const allExpenses: Expense[] = res.data;
        setExpenses(allExpenses);
        // Automatically select the first expense to show its workflow
        if (allExpenses.length > 0) {
          setSelectedExpense(allExpenses[0]);
        }
      } catch (error) {
        console.error("Failed to fetch expenses for workflow", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [])

  const stats = {
    total: expenses.length,
    pending: expenses.filter((e) => e.status === "pending").length,
    approved: expenses.filter((e) => e.status === "approved").length,
    rejected: expenses.filter((e) => e.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approval Workflow</h1>
        <p className="text-muted-foreground">Visualize and track expense approval processes</p>
      </div>

      <WorkflowStats
        totalExpenses={stats.total}
        pending={stats.pending}
        approved={stats.approved}
        rejected={stats.rejected}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <CardTitle>Expense Details</CardTitle>
            </div>
            <CardDescription>Select an expense to view its approval workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Expense</label>
              <Select
                value={selectedExpense?.id}
                onValueChange={(value) => {
                  const expense = expenses.find((e) => e.id === value)
                  setSelectedExpense(expense || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an expense" />
                </SelectTrigger>
                <SelectContent>
                  {expenses.map((expense) => (
                    <SelectItem key={expense.id} value={expense.id}>
                      {expense.category} - ${expense.amount.toFixed(2)} ({expense.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExpense && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-medium">{selectedExpense.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedExpense.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedExpense.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{selectedExpense.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Timeline</CardTitle>
            <CardDescription>Track the approval process step by step</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedExpense ? (
              <ApprovalFlow steps={selectedExpense.approvalSteps} />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>Select an expense to view its approval workflow</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}