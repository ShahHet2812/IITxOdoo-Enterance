"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Trash2, UserPlus } from "lucide-react"
import type { User } from "@/lib/types"
import { UserEditForm } from "./user-edit-form"
import { UserCreateForm } from "./user-create-form" // Import the create form

interface UserTableProps {
  users: User[]
  onUpdateUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onAddUser: (user: User) => void // Change to expect a full User object
}

export function UserTable({ users, onUpdateUser, onDeleteUser, onAddUser }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleSaveEdit = (updatedUser: User) => {
    onUpdateUser(updatedUser);
    setEditingUser(null);
  };

  const handleSaveCreate = (newUser: User) => {
    onAddUser(newUser);
    setShowAddDialog(false);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      employee: "secondary",
      manager: "default",
      admin: "destructive",
    }
    return (
      <Badge variant={variants[role as keyof typeof variants] as any}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <UserEditForm
            user={editingUser}
            onSave={handleSaveEdit}
            onCancel={() => setEditingUser(null)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Fill in the details to add a new user to the company.</DialogDescription>
          </DialogHeader>
          <UserCreateForm
            onSave={handleSaveCreate}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}