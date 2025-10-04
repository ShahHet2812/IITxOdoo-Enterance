export interface Country {
  name: string
  code: string
  currency: {
    code: string
    name: string
    symbol: string
  }
}

const FALLBACK_COUNTRIES: Country[] = [
  { name: "United States", code: "US", currency: { code: "USD", name: "US Dollar", symbol: "$" } },
  { name: "United Kingdom", code: "GB", currency: { code: "GBP", name: "British Pound", symbol: "£" } },
  { name: "European Union", code: "EU", currency: { code: "EUR", name: "Euro", symbol: "€" } },
  { name: "Japan", code: "JP", currency: { code: "JPY", name: "Japanese Yen", symbol: "¥" } },
  { name: "Canada", code: "CA", currency: { code: "CAD", name: "Canadian Dollar", symbol: "CA$" } },
  { name: "Australia", code: "AU", currency: { code: "AUD", name: "Australian Dollar", symbol: "A$" } },
  { name: "Switzerland", code: "CH", currency: { code: "CHF", name: "Swiss Franc", symbol: "CHF" } },
  { name: "China", code: "CN", currency: { code: "CNY", name: "Chinese Yuan", symbol: "¥" } },
  { name: "India", code: "IN", currency: { code: "INR", name: "Indian Rupee", symbol: "₹" } },
  { name: "Singapore", code: "SG", currency: { code: "SGD", name: "Singapore Dollar", symbol: "S$" } },
]

export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies,cca2")

    if (!response.ok) {
      console.error("[v0] API response not OK:", response.status)
      return FALLBACK_COUNTRIES
    }

    const data = await response.json()

    console.log("[v0] API response received, data type:", typeof data, "is array:", Array.isArray(data))

    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error("[v0] API response is not an array:", typeof data)
      return FALLBACK_COUNTRIES
    }

    console.log("[v0] Processing", data.length, "countries")

    const countries = data
      .filter((country: any) => {
        // Validate all required properties exist
        const hasName = country?.name?.common
        const hasCurrencies = country?.currencies && typeof country.currencies === "object"
        const hasCode = country?.cca2

        if (!hasName || !hasCurrencies || !hasCode) {
          return false
        }

        // Check if currencies object has at least one currency
        const currencyKeys = Object.keys(country.currencies)
        return currencyKeys.length > 0
      })
      .map((country: any) => {
        const currencyCode = Object.keys(country.currencies)[0]
        const currency = country.currencies[currencyCode]
        return {
          name: country.name.common,
          code: country.cca2,
          currency: {
            code: currencyCode,
            name: currency?.name || currencyCode,
            symbol: currency?.symbol || currencyCode,
          },
        }
      })
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

    console.log("[v0] Successfully processed", countries.length, "countries")
    return countries.length > 0 ? countries : FALLBACK_COUNTRIES
  } catch (error) {
    console.error("[v0] Error fetching countries:", error)
    return FALLBACK_COUNTRIES
  }
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
    const data = await response.json()
    const rate = data.rates[to]
    return amount * rate
  } catch (error) {
    console.error("[v0] Error converting currency:", error)
    return amount
  }
}
