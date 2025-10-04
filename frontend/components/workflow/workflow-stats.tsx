"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"

interface WorkflowStatsProps {
  totalExpenses: number
  pending: number
  approved: number
  rejected: number
  avgApprovalTime?: string
}

export function WorkflowStats({
  totalExpenses,
  pending,
  approved,
  rejected,
  avgApprovalTime = "2.5 days",
}: WorkflowStatsProps) {
  const approvalRate = totalExpenses > 0 ? (approved / totalExpenses) * 100 : 0
  const rejectionRate = totalExpenses > 0 ? (rejected / totalExpenses) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pending}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approved}</div>
          <Progress value={approvalRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{approvalRate.toFixed(1)}% approval rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejected}</div>
          <Progress value={rejectionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{rejectionRate.toFixed(1)}% rejection rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgApprovalTime}</div>
          <p className="text-xs text-muted-foreground">Processing time</p>
        </CardContent>
      </Card>
    </div>
  )
}
