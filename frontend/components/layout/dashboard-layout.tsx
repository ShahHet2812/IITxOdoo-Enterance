"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import type { User } from "@/lib/types"
import { ThemeProvider } from "next-themes"
import api from "@/lib/api" // Import our API utility
import { Loader2 } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push("/"); // No token found, redirect to login
        return;
      }

      try {
        // Fetch the current user's data using the token
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error("Authentication failed", error);
        // Token might be invalid or expired
        localStorage.removeItem('token');
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleLogout = () => {
    // Clear user state and token, then redirect
    setUser(null);
    localStorage.removeItem('token');
    router.push("/");
  }

  // Show a loading spinner while verifying the user
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Only render the dashboard if the user has been successfully loaded
  if (!user) {
    // This can be a brief flash before redirect, or you can return null
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar role={user.role} onLogout={handleLogout} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} notificationCount={3} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}