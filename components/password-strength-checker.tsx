"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, EyeOff, Shield, AlertTriangle, Loader2 } from "lucide-react"

interface PasswordCriteria {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  special: boolean
}

interface StrengthResult {
  score: number
  level: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong"
  color: string
  criteria: PasswordCriteria
}

interface LeakCheckResult {
  isCompromised: boolean
  breachCount: number
  message: string
}

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingLeak, setIsCheckingLeak] = useState(false)
  const [leakResult, setLeakResult] = useState<LeakCheckResult | null>(null)
  const [strength, setStrength] = useState<StrengthResult>({
    score: 0,
    level: "Very Weak",
    color: "bg-red-500",
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false,
    },
  })

  const analyzePassword = (pwd: string): StrengthResult => {
    const criteria: PasswordCriteria = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    }

    const metCriteria = Object.values(criteria).filter(Boolean).length
    let score = 0
    let level: StrengthResult["level"] = "Very Weak"
    let color = "bg-red-500"

    if (pwd.length === 0) {
      score = 0
    } else if (metCriteria <= 1) {
      score = 20
      level = "Very Weak"
      color = "bg-red-500"
    } else if (metCriteria === 2) {
      score = 40
      level = "Weak"
      color = "bg-orange-500"
    } else if (metCriteria === 3) {
      score = 60
      level = "Fair"
      color = "bg-yellow-500"
    } else if (metCriteria === 4) {
      score = 80
      level = "Good"
      color = "bg-blue-500"
    } else if (metCriteria === 5) {
      score = 100
      level = "Strong"
      color = "bg-green-500"
    }

    return { score, level, color, criteria }
  }

  const checkPasswordLeak = async () => {
    if (!password || password.length < 4) {
      return
    }

    setIsCheckingLeak(true)
    setLeakResult(null)

    try {
      const response = await fetch("/api/check-password-leak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check password")
      }

      setLeakResult(data)
    } catch (error) {
      console.error("Leak check error:", error)
      setLeakResult({
        isCompromised: false,
        breachCount: 0,
        message: "Unable to check password against breach database. Please try again.",
      })
    } finally {
      setIsCheckingLeak(false)
    }
  }

  useEffect(() => {
    setStrength(analyzePassword(password))
    // Reset leak result when password changes
    setLeakResult(null)
  }, [password])

  const criteriaItems = [
    { key: "length" as keyof PasswordCriteria, label: "At least 8 characters" },
    { key: "uppercase" as keyof PasswordCriteria, label: "Uppercase letter (A-Z)" },
    { key: "lowercase" as keyof PasswordCriteria, label: "Lowercase letter (a-z)" },
    { key: "numbers" as keyof PasswordCriteria, label: "Number (0-9)" },
    { key: "special" as keyof PasswordCriteria, label: "Special character (!@#$%^&*)" },
  ]

  return (
    <div className="space-y-6">
      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-300">
          Enter Password to Analyze
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type your password here..."
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </Button>
        </div>
      </div>

      {/* Breach Check Button */}
      {password && password.length >= 4 && (
        <div className="flex justify-center">
          <Button
            onClick={checkPasswordLeak}
            disabled={isCheckingLeak}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCheckingLeak ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking for breaches...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Check for Data Breaches
              </>
            )}
          </Button>
        </div>
      )}

      {/* Leak Check Result */}
      {leakResult && (
        <Card
          className={`border ${
            leakResult.isCompromised ? "bg-red-900/20 border-red-600" : "bg-green-900/20 border-green-600"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {leakResult.isCompromised ? (
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-medium ${leakResult.isCompromised ? "text-red-400" : "text-green-400"}`}>
                  {leakResult.isCompromised ? "Password Compromised" : "Password Secure"}
                </h3>
                <p className="text-sm text-gray-300 mt-1">{leakResult.message}</p>
                {leakResult.isCompromised && (
                  <p className="text-sm text-red-300 mt-2">
                    <strong>Recommendation:</strong> This password should not be used. Consider creating a new, unique
                    password.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strength Meter */}
      {password && (
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Password Strength</span>
                <span
                  className={`text-sm font-semibold ${
                    strength.level === "Strong"
                      ? "text-green-400"
                      : strength.level === "Good"
                        ? "text-blue-400"
                        : strength.level === "Fair"
                          ? "text-yellow-400"
                          : strength.level === "Weak"
                            ? "text-orange-400"
                            : "text-red-400"
                  }`}
                >
                  {strength.level}
                </span>
              </div>

              <div className="space-y-2">
                <Progress value={strength.score} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Weak</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Criteria Checklist */}
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Password Requirements</h3>
          <div className="space-y-3">
            {criteriaItems.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    strength.criteria[item.key] ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  {strength.criteria[item.key] ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <span className={`text-sm ${strength.criteria[item.key] ? "text-green-400" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Security Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Use a unique password for each account
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Consider using a password manager
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Enable two-factor authentication when available
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Avoid using personal information in passwords
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Never reuse passwords that have been compromised
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
