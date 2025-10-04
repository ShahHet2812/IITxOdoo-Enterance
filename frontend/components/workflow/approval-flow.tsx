"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, User } from "lucide-react"
import type { ApprovalStep } from "@/lib/types"
import { format } from "date-fns"

interface ApprovalFlowProps {
  steps: ApprovalStep[]
  className?: string
}

export function ApprovalFlow({ steps, className }: ApprovalFlowProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "approved":
        return "border-primary bg-primary/5"
      case "rejected":
        return "border-destructive bg-destructive/5"
      default:
        return "border-border bg-muted/30"
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-sm text-muted-foreground">Approval Workflow</h3>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id || index} className="relative">
            <div className="flex items-start gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    getStepColor(step.status),
                  )}
                >
                  {getStepIcon(step.status)}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-16 my-1 transition-colors",
                      step.status === "approved" ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <Card className={cn("transition-all", getStepColor(step.status))}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {/* FIX: Add a fallback for approverName */}
                        <span className="font-medium">{step.approverName || 'Unnamed Approver'}</span>
                      </div>
                      {getStatusBadge(step.status)}
                    </div>
                    {/* FIX: Add a check for approverRole before calling charAt */}
                    <p className="text-sm text-muted-foreground mb-1">
                      Role: {step.approverRole ? step.approverRole.charAt(0).toUpperCase() + step.approverRole.slice(1) : 'N/A'}
                    </p>
                    {step.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {step.status === "approved" ? "Approved" : step.status === "rejected" ? "Rejected" : "Acted"} on {format(new Date(step.timestamp), "PPp")}
                      </p>
                    )}
                    {step.comments && (
                      <div className="mt-3 p-2 rounded bg-background/50 border border-border">
                        <p className="text-sm">{step.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}