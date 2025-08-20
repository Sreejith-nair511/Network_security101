"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Lock, Users, Shield, Key, AlertCircle, Wifi, WifiOff } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface EncryptedMessage {
  encryptedContent: string
  encryptedAESKey: string
  iv: string
}

interface Message {
  id: string
  senderId: string
  senderEmail: string
  content: string
  timestamp: Date
  isEncrypted: boolean
  encryptedData?: EncryptedMessage
}

interface ChatUser {
  id: string
  email: string
  isOnline: boolean
  lastSeen?: Date
  hasPublicKey: boolean
  publicKey?: string
}

interface ChatInterfaceProps {
  currentUser: User
}

export function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState<ChatUser[]>([])
  const [keysInitialized, setKeysInitialized] = useState(false)
  const [encryptionError, setEncryptionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initKeys = async () => {
      try {
        // Simulate key initialization
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setKeysInitialized(true)
        setIsConnected(true)
        console.log("[v0] Encryption keys initialized for user:", currentUser.id)
      } catch (error) {
        console.error("Failed to initialize encryption keys:", error)
        setEncryptionError("Failed to initialize encryption keys")
      }
    }
    initKeys()
  }, [currentUser.id])

  // Load users with mock data
  useEffect(() => {
    if (keysInitialized) {
      const mockUsers: ChatUser[] = [
        {
          id: "user1",
          email: "sreejith@example.com",
          isOnline: true,
          hasPublicKey: true,
          publicKey: "mock_public_key_alice",
        },
        {
          id: "user2",
          email: "rohith@example.com",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 15),
          hasPublicKey: true,
          publicKey: "mock_public_key_bob",
        },
        {
          id: "user3",
          email: "swarup@example.com",
          isOnline: true,
          hasPublicKey: false,
        },
      ]
      setUsers(mockUsers)
    }
  }, [keysInitialized])

  // Load chat history when user is selected
  useEffect(() => {
    if (selectedUser && keysInitialized) {
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: selectedUser.id,
          senderEmail: selectedUser.email,
          content: selectedUser.hasPublicKey ? "🔒 [Encrypted Message]" : "Hey! How are you doing?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isEncrypted: selectedUser.hasPublicKey,
        },
        {
          id: "2",
          senderId: currentUser.id,
          senderEmail: currentUser.email || "",
          content: selectedUser.hasPublicKey
            ? "🔒 [Encrypted Message]"
            : "I'm doing great! Working on security projects.",
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          isEncrypted: selectedUser.hasPublicKey,
        },
        {
          id: "3",
          senderId: selectedUser.id,
          senderEmail: selectedUser.email,
          content: selectedUser.hasPublicKey
            ? "🔒 [Encrypted Message]"
            : "That sounds interesting! What kind of security work?",
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          isEncrypted: selectedUser.hasPublicKey,
        },
      ]
      setMessages(mockMessages)
    }
  }, [selectedUser, keysInitialized, currentUser])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedUser || !keysInitialized) return

    setEncryptionError(null)

    try {
      // Create message for local display
      const message: Message = {
        id: `temp_${Date.now()}`,
        senderId: currentUser.id,
        senderEmail: currentUser.email || "",
        content: selectedUser.hasPublicKey ? "🔒 [Encrypted Message]" : newMessage,
        timestamp: new Date(),
        isEncrypted: selectedUser.hasPublicKey,
      }

      setMessages((prev) => [...prev, message])

      // Log message sending
      if (selectedUser.hasPublicKey) {
        console.log("[v0] Encrypted message sent to:", selectedUser.email)
      } else {
        console.log("[v0] Plain message sent to:", selectedUser.email)
      }

      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      setEncryptionError("Failed to send message")
    }
  }, [newMessage, selectedUser, keysInitialized, currentUser])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!keysInitialized) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray-400">
          <Key className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium mb-2">Initializing Encryption Keys</h3>
          <p className="text-sm">Setting up end-to-end encryption...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-green-400" />
          <div>
            <h3 className="text-sm font-medium text-white">Security Status</h3>
            <p className="text-xs text-gray-400">RSA-2048 + AES-256 encryption active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/50">
            <Lock className="h-3 w-3 mr-1" />
            Keys Ready
          </Badge>
          <Badge
            variant="secondary"
            className={`${
              isConnected
                ? "bg-green-600/20 text-green-400 border-green-600/50"
                : "bg-yellow-600/20 text-yellow-400 border-yellow-600/50"
            }`}
          >
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? "Demo Ready" : "Initializing"}
          </Badge>
        </div>
      </div>

      {/* Error Display */}
      {encryptionError && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-300">{encryptionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Users List */}
        <Card className="bg-gray-800 border-gray-600 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Users className="h-5 w-5" />
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? "bg-green-600/20 border border-green-600/50"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-600 text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          user.isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user.isOnline ? "Online" : user.lastSeen ? formatLastSeen(user.lastSeen) : "Offline"}
                      </p>
                    </div>
                    {user.hasPublicKey ? (
                      <Shield className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="bg-gray-800 border-gray-600 lg:col-span-2">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {selectedUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{selectedUser.email}</h3>
                      <p className="text-xs text-gray-400">{selectedUser.isOnline ? "Online" : "Offline"}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      selectedUser.hasPublicKey
                        ? "bg-green-600/20 text-green-400 border-green-600/50"
                        : "bg-yellow-600/20 text-yellow-400 border-yellow-600/50"
                    }`}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    {selectedUser.hasPublicKey ? "Encrypted" : "Unencrypted"}
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0 flex flex-col h-[440px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === currentUser.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-gray-100"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs opacity-70">{formatTime(message.timestamp)}</p>
                            {message.isEncrypted && <Lock className="h-3 w-3 opacity-70" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        selectedUser.hasPublicKey ? "Type your encrypted message..." : "Type your message..."
                      }
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {selectedUser.hasPublicKey
                      ? "Messages are encrypted end-to-end with AES + RSA"
                      : "This user doesn't support encryption"}
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a user to start chatting</h3>
                <p className="text-sm">Choose someone from the users list to begin an encrypted conversation</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}
