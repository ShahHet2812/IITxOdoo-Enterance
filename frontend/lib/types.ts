export type UserRole = "admin" | "manager" | "employee"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  managerId?: string
  createdAt: Date
}

export interface Company {
  id: string
  name: string
  currency: string
  currencySymbol: string
  createdAt: Date
}

export interface Expense {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  currency: string
  convertedAmount?: number
  category: string
  description: string
  date: Date
  receiptUrl?: string
  status: "pending" | "approved" | "rejected"
  approvalSteps: ApprovalStep[]
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalStep {
  id: string
  approver: string // FIX: Changed from approverId to approver to match backend
  approverName: string
  approverRole: string
  status: "pending" | "approved" | "rejected"
  comments?: string
  timestamp?: Date
}

export interface ApprovalWorkflow {
  id: string
  companyId: string
  name: string
  steps: WorkflowStep[]
  conditions: WorkflowCondition[]
}

export interface WorkflowStep {
  id: string
  order: number
  role: UserRole
  requiresAll: boolean
  autoApproveThreshold?: number
}

export interface WorkflowCondition {
  field: "amount" | "category"
  operator: "gt" | "lt" | "eq"
  value: string | number
  action: "escalate" | "auto-approve"
}

export interface Currency {
  code: string
  name: string
  symbol: string
}