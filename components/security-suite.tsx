"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock, MessageSquare, LogOut } from "lucide-react"
import { PasswordStrengthChecker } from "@/components/password-strength-checker"
import { ChatInterface } from "@/components/chat-interface"

interface SecuritySuiteProps {
  userName: string
}

export function SecuritySuite({ userName }: SecuritySuiteProps) {
  const [activeTab, setActiveTab] = useState("password")
  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("user_name")
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Network Security Suite</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome, {userName}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <Lock className="h-4 w-4" />
              Password Security
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-green-600">
              <MessageSquare className="h-4 w-4" />
              Secure Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Lock className="h-5 w-5" />
                  Password Strength & Leak Checker
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Check password strength and verify if it has been compromised in data breaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordStrengthChecker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <MessageSquare className="h-5 w-5" />
                  End-to-End Encrypted Chat
                </CardTitle>
                <CardDescription className="text-gray-400">Secure messaging with AES + RSA encryption</CardDescription>
              </CardHeader>
              <CardContent>
                <ChatInterface currentUser={userName} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
