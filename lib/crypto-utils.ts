// Cryptographic utilities for end-to-end encryption
// Uses AES for message encryption and RSA for key exchange

export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface EncryptedMessage {
  encryptedContent: string
  encryptedAESKey: string
  iv: string
}

// Generate RSA key pair for asymmetric encryption
export async function generateRSAKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"],
  )

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

// Generate AES key for symmetric encryption
export async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"],
  )
}

// Export public key to string format for sharing
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", publicKey)
  const exportedAsString = arrayBufferToBase64(exported)
  return exportedAsString
}

// Import public key from string format
export async function importPublicKey(publicKeyString: string): Promise<CryptoKey> {
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyString)
  return await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  )
}

// Export private key to string format for storage
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey)
  const exportedAsString = arrayBufferToBase64(exported)
  return exportedAsString
}

// Import private key from string format
export async function importPrivateKey(privateKeyString: string): Promise<CryptoKey> {
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyString)
  return await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  )
}

// Encrypt message using AES + RSA hybrid encryption
export async function encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<EncryptedMessage> {
  // Generate a random AES key for this message
  const aesKey = await generateAESKey()

  // Generate random IV for AES encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  // Encrypt the message with AES
  const encodedMessage = new TextEncoder().encode(message)
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encodedMessage,
  )

  // Export AES key and encrypt it with recipient's RSA public key
  const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey)
  const encryptedAESKey = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    recipientPublicKey,
    exportedAESKey,
  )

  return {
    encryptedContent: arrayBufferToBase64(encryptedContent),
    encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
    iv: arrayBufferToBase64(iv),
  }
}

// Decrypt message using AES + RSA hybrid decryption
export async function decryptMessage(encryptedMessage: EncryptedMessage, privateKey: CryptoKey): Promise<string> {
  try {
    // Decrypt the AES key using RSA private key
    const encryptedAESKeyBuffer = base64ToArrayBuffer(encryptedMessage.encryptedAESKey)
    const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedAESKeyBuffer,
    )

    // Import the decrypted AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedAESKeyBuffer,
      {
        name: "AES-GCM",
      },
      false,
      ["decrypt"],
    )

    // Decrypt the message content using AES
    const encryptedContentBuffer = base64ToArrayBuffer(encryptedMessage.encryptedContent)
    const ivBuffer = base64ToArrayBuffer(encryptedMessage.iv)

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      aesKey,
      encryptedContentBuffer,
    )

    return new TextDecoder().decode(decryptedContent)
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("Failed to decrypt message")
  }
}

// Utility functions for base64 encoding/decoding
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a secure random string for session IDs
export function generateSecureId(): string {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
