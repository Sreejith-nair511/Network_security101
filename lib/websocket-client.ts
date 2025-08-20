// WebSocket client utilities for real-time chat functionality

export interface WebSocketMessage {
  type: string
  data: any
}

export interface ChatMessage {
  id: string
  senderId: string
  recipientId: string
  encryptedContent: string
  encryptedAESKey: string
  iv: string
  timestamp: string
}

export interface UserStatus {
  userId: string
  email: string
  isOnline: boolean
  lastSeen: string
}

export class ChatWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers = new Map<string, (data: any) => void>()

  constructor(private userId: string) {}

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${protocol}//${window.location.host}/api/websocket`

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("[WebSocket Client] Connected to chat server")
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("[WebSocket Client] Failed to parse message:", error)
          }
        }

        this.ws.onclose = (event) => {
          console.log("[WebSocket Client] Connection closed:", event.code, event.reason)
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error("[WebSocket Client] Connection error:", error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message.data)
    } else {
      console.log(`[WebSocket Client] Unhandled message type: ${message.type}`)
    }
  }

  // Register message handler
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  // Remove message handler
  offMessage(type: string) {
    this.messageHandlers.delete(type)
  }

  // Send message to server
  private send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error("[WebSocket Client] Cannot send message: connection not open")
    }
  }

  // Send encrypted chat message
  sendMessage(recipientId: string, encryptedContent: string, encryptedAESKey: string, iv: string) {
    this.send({
      type: "send_message",
      data: {
        recipientId,
        encryptedContent,
        encryptedAESKey,
        iv,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Send typing status
  startTyping(recipientId: string) {
    this.send({
      type: "typing_start",
      data: { recipientId },
    })
  }

  stopTyping(recipientId: string) {
    this.send({
      type: "typing_stop",
      data: { recipientId },
    })
  }

  // Request user list
  requestUserList() {
    this.send({
      type: "request_user_list",
      data: {},
    })
  }

  // Handle reconnection
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`[WebSocket Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("[WebSocket Client] Reconnection failed:", error)
        })
      }, delay)
    } else {
      console.error("[WebSocket Client] Max reconnection attempts reached")
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance for global use
let chatClient: ChatWebSocketClient | null = null

export function getChatClient(userId: string): ChatWebSocketClient {
  if (!chatClient || chatClient["userId"] !== userId) {
    chatClient = new ChatWebSocketClient(userId)
  }
  return chatClient
}

export function disconnectChatClient() {
  if (chatClient) {
    chatClient.disconnect()
    chatClient = null
  }
}
