"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

interface UserEditFormProps {
  user: User | null
  onSave: (user: User) => void
  onCancel: () => void
}

export function UserEditForm({ user, onSave, onCancel }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee" as "employee" | "manager" | "admin",
    managerId: "",
  })
  const [managers, setManagers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId || "",
      })
    }
  }, [user])

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get('/users');
        setManagers(res.data.filter((u: User) => u.role === 'manager'));
      } catch (error) {
        console.error("Failed to fetch managers", error);
      }
    };
    fetchManagers();
  }, [])

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, formData);
      onSave(res.data);
    } catch (error) {
      console.error("Failed to update user", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
          <SelectTrigger id="edit-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.role === 'employee' && (
        <div className="space-y-2">
          <Label htmlFor="edit-manager">Manager</Label>
          <Select value={formData.managerId} onValueChange={(value: any) => setFormData({ ...formData, managerId: value })}>
            <SelectTrigger id="edit-manager">
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}