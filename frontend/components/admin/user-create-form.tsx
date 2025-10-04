"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

interface UserCreateFormProps {
  onSave: (user: User) => void
  onCancel: () => void
}

export function UserCreateForm({ onSave, onCancel }: UserCreateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as "employee" | "manager" | "admin",
    managerId: "",
  })
  const [managers, setManagers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get('/users');
        setManagers(res.data.filter((u: User) => u.role === 'manager' || u.role === 'admin'));
      } catch (error) {
        console.error("Failed to fetch managers", error);
      }
    };
    fetchManagers();
  }, [])

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/users`, formData);
      onSave(res.data);
    } catch (error) {
      console.error("Failed to create user", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="create-name">Name</Label>
        <Input
          id="create-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-email">Email</Label>
        <Input
          id="create-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-password">Password</Label>
        <Input
          id="create-password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-role">Role</Label>
        <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
          <SelectTrigger id="create-role">
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
          <Label htmlFor="create-manager">Manager</Label>
          <Select value={formData.managerId} onValueChange={(value: any) => setFormData({ ...formData, managerId: value })}>
            <SelectTrigger id="create-manager">
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
          Create User
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}