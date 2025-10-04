"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { CheckCircle, XCircle, Eye, FileText, ArrowUpCircle } from "lucide-react"
import type { Expense } from "@/lib/types"

interface ApprovalCardProps {
  expense: Expense
  onApprove: (expenseId: string, comments: string) => void
  onReject: (expenseId: string, comments: string) => void
  onEscalate: (expenseId: string, comments: string) => void
}

export function ApprovalCard({ expense, onApprove, onReject, onEscalate }: ApprovalCardProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<"approve" | "reject" | "escalate" | null>(null)
  const [comments, setComments] = useState("")
  const [showDetails, setShowDetails] = useState(false)

  const handleAction = (actionType: "approve" | "reject" | "escalate") => {
    setAction(actionType)
    setShowDialog(true)
  }

  const handleConfirm = () => {
    if (action === "approve") {
      onApprove(expense.id, comments)
    } else if (action === "reject") {
      onReject(expense.id, comments)
    } else if (action === "escalate") {
      onEscalate(expense.id, comments)
    }
    setShowDialog(false)
    setComments("")
    setAction(null)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-right">
              <div className="text-2xl font-bold">
                {/* Show converted amount if available and different */}
                {expense.convertedAmount && expense.currency !== 'USD' 
                  ? `$${expense.convertedAmount.toFixed(2)}` 
                  : `${expense.currency} ${expense.amount.toFixed(2)}`}
              </div>
              {expense.convertedAmount && expense.currency !== 'USD' && (
                <div className="text-sm text-muted-foreground">
                  Original: {expense.currency} {expense.amount.toFixed(2)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{expense.category}</h3>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{expense.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Employee: {expense.employeeName}</span>
                <span>Date: {format(expense.date, "MMM dd, yyyy")}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {expense.currency} {expense.amount.toFixed(2)}
              </div>
              {expense.convertedAmount && expense.convertedAmount !== expense.amount && (
                <div className="text-sm text-muted-foreground">≈ ${expense.convertedAmount.toFixed(2)}</div>
              )}
            </div>
          </div>

          {expense.receiptUrl && (
            <div className="mb-4 p-3 rounded-lg bg-muted flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Receipt attached</span>
              <Button variant="link" size="sm" className="ml-auto p-0 h-auto" onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => handleAction("approve")} className="flex-1" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button onClick={() => handleAction("reject")} variant="destructive" className="flex-1" size="sm">
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => handleAction("escalate")} variant="outline" size="sm">
              <ArrowUpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Expense" : action === "reject" ? "Reject Expense" : "Escalate Expense"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Add any comments for the employee (optional)"
                : action === "reject"
                  ? "Please provide a reason for rejection"
                  : "Add comments for escalation"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder={
                  action === "reject" ? "Explain why this expense is being rejected..." : "Add your comments..."
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                required={action === "reject"}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirm} className="flex-1" disabled={action === "reject" && !comments}>
                Confirm
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Employee</Label>
                <p className="font-medium">{expense.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="font-medium">{expense.category}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium">
                  {expense.currency} {expense.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-medium">{format(expense.date, "PPP")}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{expense.description}</p>
            </div>
            {expense.receiptUrl && (
              <div>
                <Label className="text-muted-foreground">Receipt</Label>
                <div className="mt-2 border border-border rounded-lg p-4 bg-muted">
                  <p className="text-sm text-center">Receipt preview would appear here</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
