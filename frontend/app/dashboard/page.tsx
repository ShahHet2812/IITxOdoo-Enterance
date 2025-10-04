"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Receipt, Clock, CheckCircle, TrendingUp, Plus, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Expense, User } from "@/lib/types"
import { format } from "date-fns"
import api from "@/lib/api" // Import our new API utility

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    myExpenses: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0,
  })
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // You'll need to create this backend route to get the current user
        const userRes = await api.get('/auth/me'); 
        const currentUser = userRes.data;
        setUser(currentUser);

        // Fetch expenses from the backend
        const expensesRes = await api.get('/expenses');
        const allExpenses: Expense[] = expensesRes.data;

        // Calculate stats based on fetched data and user role
        if (currentUser.role === "employee") {
            const myExpenses = allExpenses.filter(e => e.employeeId === currentUser.id);
            setStats({
                myExpenses: myExpenses.length,
                pending: myExpenses.filter((e) => e.status === "pending").length,
                approved: myExpenses.filter((e) => e.status === "approved").length,
                totalAmount: myExpenses.reduce((sum, e) => sum + e.amount, 0),
            });
            setRecentExpenses(myExpenses.slice(0, 5));
        } else { // For manager and admin
             setStats({
                myExpenses: allExpenses.length,
                pending: allExpenses.filter((e) => e.status === "pending").length,
                approved: allExpenses.filter((e) => e.status === "approved").length,
                totalAmount: allExpenses.reduce((sum, e) => sum + e.amount, 0),
            });
            // For managers, you might want a specific endpoint for pending approvals
            const pendingForManager = allExpenses.filter(e => e.status === 'pending');
            setRecentExpenses(currentUser.role === 'manager' ? pendingForManager.slice(0,5) : allExpenses.slice(0,5));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // If token is invalid or expired, redirect to login
        localStorage.removeItem('token');
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading || !user) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your expense management</p>
        </div>
        {user?.role === "employee" && (
          <Button onClick={() => router.push("/dashboard/submit")}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Expense
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Stats Cards remain mostly the same */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === "employee" ? "My Expenses" : "Total Expenses"}
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myExpenses}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        {/* ... other stat cards ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === "employee" ? "Pending" : "Awaiting Approval"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {user?.role === "employee"
                  ? "Recent Expenses"
                  : user?.role === "manager"
                    ? "Pending Approvals"
                    : "Recent Activity"}
              </CardTitle>
              <CardDescription>
                {/* ... description ... */}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                router.push(
                  user?.role === "employee"
                    ? "/dashboard/history"
                    : user?.role === "manager"
                      ? "/dashboard/approvals"
                      : "/dashboard/expenses",
                )
              }
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4" />
              <p>No expenses to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{expense.category}</h4>
                      {getStatusBadge(expense.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{expense.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{expense.employeeName}</span>
                      <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}