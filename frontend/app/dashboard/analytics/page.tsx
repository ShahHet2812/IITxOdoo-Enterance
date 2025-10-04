"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseCharts } from "@/components/analytics/expense-charts"
import { Download, TrendingUp, DollarSign, Receipt, Users, Loader2 } from "lucide-react"
import type { Expense } from "@/lib/types"
import api from "@/lib/api" // Import the api utility

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [timeRange, setTimeRange] = useState("all")
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true) // Add loading state

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [])

  useEffect(() => {
    let filtered = expenses

    if (timeRange !== "all") {
      const now = new Date()
      const daysAgo = timeRange === "30" ? 30 : timeRange === "90" ? 90 : 365

      filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const diffTime = Math.abs(now.getTime() - expenseDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= daysAgo
      })
    }

    setFilteredExpenses(filtered)
  }, [timeRange, expenses])

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.convertedAmount || expense.amount), 0)
  const avgExpense = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0
  const approvedAmount = filteredExpenses
    .filter((e) => e.status === "approved")
    .reduce((sum, expense) => sum + (expense.convertedAmount || expense.amount), 0)
  const uniqueEmployees = new Set(filteredExpenses.map((e) => e.employeeId)).size

  const handleExport = () => {
    const csvContent = [
      ["Date", "Employee", "Category", "Amount", "Currency", "Status", "Description"].join(","),
      ...filteredExpenses.map((expense) =>
        [
          new Date(expense.date).toLocaleDateString(),
          expense.employeeName,
          expense.category,
          expense.amount,
          expense.currency,
          expense.status,
          `"${expense.description}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive expense insights and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
            <p className="text-xs text-muted-foreground">Submitted claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalAmount > 0 ? ((approvedAmount / totalAmount) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Expense</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{uniqueEmployees} employees</p>
          </CardContent>
        </Card>
      </div>

      <ExpenseCharts expenses={filteredExpenses} />

      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses
              .reduce(
                (acc, expense) => {
                  const existing = acc.find((item) => item.category === expense.category)
                  if (existing) {
                    existing.amount += (expense.convertedAmount || expense.amount)
                  } else {
                    acc.push({ category: expense.category, amount: (expense.convertedAmount || expense.amount) })
                  }
                  return acc
                },
                [] as { category: string; amount: number }[],
              )
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.category}</p>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(item.amount / totalAmount) * 100}%` }} />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-bold">${item.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{((item.amount / totalAmount) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}