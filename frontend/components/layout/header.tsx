"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: User
  notificationCount?: number
  onLogout: () => void // FIX: Add onLogout prop
}

export function Header({ user, notificationCount = 0, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter() // FIX: Add router

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: "Admin",
      manager: "Manager",
      employee: "Employee",
    }
    return badges[role as keyof typeof badges] || role
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, {user.name.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">{getRoleBadge(user.role)}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* FIX: Add Dropdown for Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">New expense from John Doe</p>
                <p className="text-xs text-muted-foreground">Travel - $150.00</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
               <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Your expense was approved</p>
                <p className="text-xs text-muted-foreground">Office Supplies - $45.50</p>
              </div>
            </DropdownMenuItem>
             <DropdownMenuItem>
               <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Team expense report ready</p>
                <p className="text-xs text-muted-foreground">Q3 2025</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* FIX: Add router push for profile */}
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* FIX: Add onLogout handler */}
            <DropdownMenuItem className="text-destructive" onClick={onLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}