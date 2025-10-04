"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building2, DollarSign, Settings, Save, Loader2 } from "lucide-react"
import type { Company } from "@/lib/types"
import api from "@/lib/api"

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD",
    approvalThreshold: 1000,
    requireManagerApproval: true,
    requireAdminApproval: false,
  })
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await api.get('/company');
        const companyData = res.data;
        setCompany(companyData);
        setFormData({
          name: companyData.name || "",
          currency: companyData.currency || "USD",
          approvalThreshold: companyData.approvalThreshold || 1000,
          requireManagerApproval: companyData.requireManagerApproval ?? true,
          requireAdminApproval: companyData.requireAdminApproval ?? false,
        });
      } catch (error) {
        console.error("Failed to fetch company data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
        await api.put('/company', formData);
        // Optionally, show a success toast message here
    } catch (error) {
        console.error("Failed to save company settings", error);
        // Optionally, show an error toast message here
    } finally {
        setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage company settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>Basic company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Approval Workflow</CardTitle>
          </div>
          <CardDescription>Configure expense approval rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Auto-Approval Threshold</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                id="threshold"
                type="number"
                value={formData.approvalThreshold}
                onChange={(e) => setFormData({ ...formData, approvalThreshold: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Expenses below this amount will be auto-approved for trusted employees
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Manager Approval</Label>
                <p className="text-sm text-muted-foreground">All expenses must be approved by a manager</p>
              </div>
              <Button
                variant={formData.requireManagerApproval ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, requireManagerApproval: !formData.requireManagerApproval })}
              >
                {formData.requireManagerApproval ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">High-value expenses require admin approval</p>
              </div>
              <Button
                variant={formData.requireAdminApproval ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, requireAdminApproval: !formData.requireAdminApproval })}
              >
                {formData.requireAdminApproval ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}