import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get list of users with their public keys
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all users except current user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error("Users fetch error:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get public keys for all users
    const { data: publicKeys, error: keysError } = await supabase.from("user_keys").select("user_id, public_key")

    if (keysError) {
      console.error("Keys fetch error:", keysError)
      return NextResponse.json({ error: "Failed to fetch public keys" }, { status: 500 })
    }

    // Combine user data with public key status
    const usersWithKeys = users.users
      .filter((u) => u.id !== user.id)
      .map((u) => ({
        id: u.id,
        email: u.email || "",
        hasPublicKey: publicKeys.some((key) => key.user_id === u.id),
        publicKey: publicKeys.find((key) => key.user_id === u.id)?.public_key || null,
      }))

    return NextResponse.json({ users: usersWithKeys })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
