"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ApprovalCard } from "@/components/approvals/approval-card"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { Expense, User } from "@/lib/types"
import api from "@/lib/api"

export default function ApprovalsPage() {
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;
        setCurrentUser(user);

        const expensesRes = await api.get('/expenses');
        const allExpenses: Expense[] = expensesRes.data;
        
        // FIX: Correctly filter for expenses that are pending AND waiting for this specific user's approval
        const expensesForApproval = allExpenses.filter(exp =>
          exp.status === 'pending' && exp.approvalSteps.some(step => step.approver.toString() === user.id && step.status === 'pending')
        );

        setPendingExpenses(expensesForApproval);
      } catch (error) {
        console.error("Failed to fetch data for approvals", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [])

  const handleAction = async (expenseId: string, comments: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/expenses/${expenseId}/status`, { status, comments });
      setPendingExpenses(prev => prev.filter(e => e.id !== expenseId));
    } catch (error) {
        console.error(`Failed to ${status} expense`, error);
    }
  }

  const handleApprove = (expenseId: string, comments: string) => {
    handleAction(expenseId, comments, 'approved');
  }

  const handleReject = (expenseId: string, comments: string) => {
    handleAction(expenseId, comments, 'rejected');
  }

  const handleEscalate = (expenseId: string, comments: string) => {
    console.log(`Escalating expense ${expenseId} with comments: ${comments}`);
  }

  const urgentExpenses = pendingExpenses.filter((e) => e.amount > 500);

  const stats = {
    pending: pendingExpenses.length,
    urgent: urgentExpenses.length,
    approvedToday: 0, // Placeholder
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending expense claims</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Require your review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">High-value expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">Processed expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Pending
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent
            {stats.urgent > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.urgent}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pendingExpenses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground">No pending approvals at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            pendingExpenses.map((expense) => (
              <ApprovalCard
                key={expense.id}
                expense={expense}
                onApprove={handleApprove}
                onReject={handleReject}
                onEscalate={handleEscalate}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
           {urgentExpenses.length === 0 ? (
             <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No urgent items</h3>
                <p className="text-sm text-muted-foreground">No high-value expenses are waiting for your approval.</p>
              </CardContent>
            </Card>
           ) : (
             urgentExpenses.map((expense) => (
              <ApprovalCard
                key={expense.id}
                expense={expense}
                onApprove={handleApprove}
                onReject={handleReject}
                onEscalate={handleEscalate}
              />
            ))
           )}
        </TabsContent>
      </Tabs>
    </div>
  )
}