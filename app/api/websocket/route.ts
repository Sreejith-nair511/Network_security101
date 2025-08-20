import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { upgradeWebSocket } from "https://deno.land/std@0.168.0/ws/mod.ts" // Declare Deno variable

// WebSocket connection management
const connections = new Map<string, WebSocket>()
const userSessions = new Map<string, { userId: string; email: string; lastSeen: Date }>()

export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get("upgrade")
  if (upgrade !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 })
  }

  try {
    // Get user authentication from Supabase
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Create WebSocket connection
    const { socket, response } = upgradeWebSocket(request)

    const connectionId = `${user.id}_${Date.now()}`

    socket.onopen = () => {
      console.log(`[WebSocket] User connected: ${user.email} (${connectionId})`)
      connections.set(connectionId, socket)
      userSessions.set(user.id, {
        userId: user.id,
        email: user.email || "",
        lastSeen: new Date(),
      })

      // Broadcast user online status
      broadcastUserStatus(user.id, true)

      // Send initial connection confirmation
      socket.send(
        JSON.stringify({
          type: "connection_established",
          data: {
            connectionId,
            userId: user.id,
            email: user.email,
          },
        }),
      )
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleWebSocketMessage(connectionId, user.id, message)
      } catch (error) {
        console.error("[WebSocket] Invalid message format:", error)
        socket.send(
          JSON.stringify({
            type: "error",
            data: { message: "Invalid message format" },
          }),
        )
      }
    }

    socket.onclose = () => {
      console.log(`[WebSocket] User disconnected: ${user.email} (${connectionId})`)
      connections.delete(connectionId)

      // Update user status to offline
      const session = userSessions.get(user.id)
      if (session) {
        session.lastSeen = new Date()
        broadcastUserStatus(user.id, false)
      }
    }

    socket.onerror = (error) => {
      console.error(`[WebSocket] Connection error for ${user.email}:`, error)
    }

    return response
  } catch (error) {
    console.error("[WebSocket] Setup error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

// Handle different types of WebSocket messages
function handleWebSocketMessage(connectionId: string, userId: string, message: any) {
  const { type, data } = message

  switch (type) {
    case "send_message":
      handleSendMessage(userId, data)
      break
    case "typing_start":
      handleTypingStatus(userId, data.recipientId, true)
      break
    case "typing_stop":
      handleTypingStatus(userId, data.recipientId, false)
      break
    case "request_user_list":
      handleUserListRequest(connectionId)
      break
    default:
      console.log(`[WebSocket] Unknown message type: ${type}`)
  }
}

// Handle sending encrypted messages
async function handleSendMessage(senderId: string, messageData: any) {
  const { recipientId, encryptedContent, encryptedAESKey, iv, timestamp } = messageData

  try {
    // Store message in database
    const supabase = createClient()
    const { error } = await supabase.from("chat_messages").insert({
      sender_id: senderId,
      recipient_id: recipientId,
      encrypted_content: encryptedContent,
      iv: iv,
      created_at: timestamp,
    })

    if (error) {
      console.error("[WebSocket] Database error:", error)
      return
    }

    // Broadcast message to recipient
    const recipientConnections = Array.from(connections.entries()).filter(([id]) => {
      const session = userSessions.get(recipientId)
      return session && id.startsWith(recipientId)
    })

    const messagePayload = {
      type: "new_message",
      data: {
        id: `${Date.now()}_${senderId}`,
        senderId,
        recipientId,
        encryptedContent,
        encryptedAESKey,
        iv,
        timestamp,
      },
    }

    recipientConnections.forEach(([, socket]) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messagePayload))
      }
    })

    // Send confirmation to sender
    const senderConnections = Array.from(connections.entries()).filter(([id]) => id.startsWith(senderId))
    senderConnections.forEach(([, socket]) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message_sent",
            data: { messageId: messagePayload.data.id },
          }),
        )
      }
    })
  } catch (error) {
    console.error("[WebSocket] Send message error:", error)
  }
}

// Handle typing indicators
function handleTypingStatus(userId: string, recipientId: string, isTyping: boolean) {
  const recipientConnections = Array.from(connections.entries()).filter(([id]) => id.startsWith(recipientId))

  const typingPayload = {
    type: "typing_status",
    data: {
      userId,
      isTyping,
    },
  }

  recipientConnections.forEach(([, socket]) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(typingPayload))
    }
  })
}

// Broadcast user online/offline status
function broadcastUserStatus(userId: string, isOnline: boolean) {
  const session = userSessions.get(userId)
  if (!session) return

  const statusPayload = {
    type: "user_status",
    data: {
      userId,
      email: session.email,
      isOnline,
      lastSeen: session.lastSeen.toISOString(),
    },
  }

  // Broadcast to all connected users
  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(statusPayload))
    }
  })
}

// Handle user list requests
function handleUserListRequest(connectionId: string) {
  const socket = connections.get(connectionId)
  if (!socket || socket.readyState !== WebSocket.OPEN) return

  const userList = Array.from(userSessions.values()).map((session) => ({
    userId: session.userId,
    email: session.email,
    isOnline: true, // If they're in userSessions, they're online
    lastSeen: session.lastSeen.toISOString(),
  }))

  socket.send(
    JSON.stringify({
      type: "user_list",
      data: { users: userList },
    }),
  )
}
