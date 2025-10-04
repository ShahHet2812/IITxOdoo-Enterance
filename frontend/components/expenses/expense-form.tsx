"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Upload, Scan, Loader2 } from "lucide-react"
import type { Company } from "@/lib/types"
import { useRouter } from "next/navigation"
import api from "@/lib/api" // Use the centralized api instance

const categories = [
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Software & Subscriptions",
  "Marketing",
  "Training & Development",
  "Equipment",
  "Other",
]

// Define a type for the currency object
type Currency = {
  code: string
  name: string
}

export function ExpenseForm() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>()
  const [receipt, setReceipt] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [currencies, setCurrencies] = useState<Currency[]>([]) // State for the currency list
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effect to fetch the company's default currency
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/company")
        setCompany(res.data)
        // Set the default currency if available from the company profile
        if (res.data.currency) {
          setCurrency(res.data.currency)
        }
      } catch (error) {
        console.error("Failed to fetch company info", error)
      }
    }
    fetchCompany()
  }, [])

  // Effect to fetch all world currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
        const data = await response.json()

        const currencyMap = new Map<string, string>()

        data.forEach((country: any) => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(([code, details]: [string, any]) => {
              if (!currencyMap.has(code) && details.name) {
                currencyMap.set(code, details.name)
              }
            })
          }
        })

        const sortedCurrencies = Array.from(currencyMap.entries())
          .map(([code, name]) => ({ code, name }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setCurrencies(sortedCurrencies)
      } catch (error) {
        console.error("Failed to fetch currencies", error)
      }
    }
    fetchCurrencies()
  }, [])

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceipt(file)
      setScanning(true)

      const formData = new FormData()
      formData.append("receipt", file)

      try {
        const res = await api.post("/expenses/scan", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        // MODIFIED: Destructure currency from the response
        const { amount, date, description, category, currency } = res.data
        if (amount) setAmount(amount.toString())
        if (date) setDate(new Date(date))
        if (description) setDescription(description)
        if (category) setCategory(category)
        if (currency) setCurrency(currency) // MODIFIED: Set the currency state if detected
      } catch (error) {
        console.error("Failed to scan receipt", error)
      } finally {
        setScanning(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    setLoading(true)

    try {
      const expenseData = {
        amount: Number.parseFloat(amount),
        currency,
        category,
        description,
        date: date.toISOString(),
      }

      await api.post("/expenses", expenseData)

      setLoading(false)
      router.push("/dashboard/history")
    } catch (error) {
      console.error("Failed to submit expense", error)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>Fill in the details of your expense claim or scan a receipt to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency} required>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Receipt
                  </>
                )}
              </Button>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleScanReceipt}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
            {receipt && (
              <p className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                <Upload className="h-4 w-4" />
                {receipt.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Expense"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}