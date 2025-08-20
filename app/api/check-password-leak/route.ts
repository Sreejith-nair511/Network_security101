import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Hash the password with SHA-1
    const sha1Hash = createHash("sha1").update(password).digest("hex").toUpperCase()

    // Use k-anonymity: send only first 5 characters to HaveIBeenPwned
    const hashPrefix = sha1Hash.substring(0, 5)
    const hashSuffix = sha1Hash.substring(5)

    // Query HaveIBeenPwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
      method: "GET",
      headers: {
        "User-Agent": "NetworkSecuritySuite-PasswordChecker",
      },
    })

    if (!response.ok) {
      throw new Error(`HaveIBeenPwned API error: ${response.status}`)
    }

    const responseText = await response.text()

    // Parse the response to find our hash suffix
    const lines = responseText.split("\n")
    let breachCount = 0
    let isCompromised = false

    for (const line of lines) {
      const [suffix, count] = line.trim().split(":")
      if (suffix === hashSuffix) {
        breachCount = Number.parseInt(count, 10)
        isCompromised = true
        break
      }
    }

    return NextResponse.json({
      isCompromised,
      breachCount,
      message: isCompromised
        ? `This password has been found in ${breachCount.toLocaleString()} data breach${breachCount > 1 ? "es" : ""}`
        : "This password has not been found in any known data breaches",
    })
  } catch (error) {
    console.error("Password leak check error:", error)
    return NextResponse.json({ error: "Failed to check password against breach database" }, { status: 500 })
  }
}
