"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Receipt, CheckSquare, Users, Settings, GitBranch, History, LogOut, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserRole } from "@/lib/types"

interface SidebarProps {
  role: UserRole
  onLogout: () => void
}

export function Sidebar({ role, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/expenses", label: "All Expenses", icon: Receipt },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/workflow", label: "Workflow", icon: GitBranch },
    { href: "/dashboard/settings", label: "Settings", icon: Settings }, // FIX: Only for Admin
  ]

  const managerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare },
    { href: "/dashboard/team", label: "Team", icon: Briefcase },
    { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  ]

  const employeeLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/submit", label: "Submit Expense", icon: Receipt },
    { href: "/dashboard/history", label: "My Expenses", icon: History },
  ]

  const links = role === "admin" ? adminLinks : role === "manager" ? managerLinks : employeeLinks

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">ExpenseHub</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary text-secondary-foreground font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}