"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Search, Eye, Receipt, Loader2 } from "lucide-react"
import type { Expense } from "@/lib/types"
import api from "@/lib/api" // Import the api utility

export default function ExpenseHistoryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true) // Add loading state

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data);
        setFilteredExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch expense history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [])

  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter(
        (exp) =>
          exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((exp) => exp.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((exp) => exp.category === categoryFilter)
    }

    setFilteredExpenses(filtered)
  }, [searchTerm, statusFilter, categoryFilter, expenses])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const categories = Array.from(new Set(expenses.map((e) => e.category)))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expense submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {expenses.length === 0
                  ? "You haven't submitted any expenses yet."
                  : "No expenses match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{expense.category}</h3>
                      {getStatusBadge(expense.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Date: {format(new Date(expense.date), "MMM dd, yyyy")}</span>
                      <span>Submitted: {format(new Date(expense.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <div>
                      <div className="text-2xl font-bold">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </div>
                      {expense.convertedAmount && expense.convertedAmount !== expense.amount && (
                        <div className="text-sm text-muted-foreground">
                          Converted: ${expense.convertedAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>

                {expense.approvalSteps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Approval Timeline</p>
                    <div className="space-y-2">
                      {expense.approvalSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              step.status === "approved"
                                ? "bg-primary"
                                : step.status === "rejected"
                                  ? "bg-destructive"
                                  : "bg-muted-foreground",
                            )}
                          />
                          <span className="text-muted-foreground">
                            {step.approverName} ({step.approverRole})
                          </span>
                          <span className="ml-auto">{getStatusBadge(step.status)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}