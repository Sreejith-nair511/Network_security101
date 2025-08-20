"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SecuritySuite } from "@/components/security-suite"

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedName = localStorage.getItem("user_name")
    if (!storedName) {
      router.push("/auth/login")
    } else {
      setUserName(storedName)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!userName) {
    return null // Will redirect to login
  }

  return <SecuritySuite userName={userName} />
}
