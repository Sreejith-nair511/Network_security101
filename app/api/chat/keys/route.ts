import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Store user's public key
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicKey } = await request.json()

    if (!publicKey) {
      return NextResponse.json({ error: "Public key is required" }, { status: 400 })
    }

    // Store or update user's public key
    const { error } = await supabase
      .from("user_keys")
      .upsert({ user_id: user.id, public_key: publicKey }, { onConflict: "user_id" })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to store public key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
