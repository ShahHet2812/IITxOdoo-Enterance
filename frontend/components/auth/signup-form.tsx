"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchCountries, type Country } from "@/lib/currency-api"
import { UserPlus, Loader2 } from "lucide-react"
import type { User, Company } from "@/lib/types"
import axios from 'axios';

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [countries, setCountries] = useState<Country[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(true)

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries()
        setCountries(data)
      } catch (err) {
        console.error("Failed to load countries", err);
        setError("Could not load country list. Please try again later.");
      } finally {
        setLoadingCountries(false)
      }
    }
    loadCountries()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedCountry) {
      setError("Please select a country")
      return
    }

    setLoading(true)

    const country = countries.find((c) => c.code === selectedCountry)
    if (!country) {
      setError("Invalid country selection")
      setLoading(false)
      return
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password,
        companyName,
        currency: country.currency.code,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // We can get user data from the signup response if the backend sends it
        // Or redirect to login, or fetch user data in the dashboard
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || "An error occurred during sign up.");
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
        <CardDescription>Set up your company and start managing expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country & Currency</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry} required>
              <SelectTrigger id="country">
                <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select country"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency.code} - {country.currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || loadingCountries}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}