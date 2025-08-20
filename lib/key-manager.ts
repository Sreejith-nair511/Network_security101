// Key management utilities for storing and retrieving encryption keys

import type { KeyPair } from "./crypto-utils"
import {
  generateRSAKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPublicKey,
  importPrivateKey,
} from "./crypto-utils"

export { exportPublicKey, importPublicKey } from "./crypto-utils"

export interface StoredKeyPair {
  publicKey: string
  privateKey: string
}

export interface UserPublicKey {
  userId: string
  email: string
  publicKey: string
}

// Generate and store user's key pair in localStorage
export async function initializeUserKeys(userId: string): Promise<StoredKeyPair> {
  const existingKeys = getUserKeys(userId)
  if (existingKeys) {
    return existingKeys
  }

  const keyPair = await generateRSAKeyPair()
  const publicKeyString = await exportPublicKey(keyPair.publicKey)
  const privateKeyString = await exportPrivateKey(keyPair.privateKey)

  const storedKeyPair: StoredKeyPair = {
    publicKey: publicKeyString,
    privateKey: privateKeyString,
  }

  localStorage.setItem(`keys_${userId}`, JSON.stringify(storedKeyPair))
  return storedKeyPair
}

// Retrieve user's stored keys
export function getUserKeys(userId: string): StoredKeyPair | null {
  const stored = localStorage.getItem(`keys_${userId}`)
  if (!stored) return null
  return JSON.parse(stored)
}

// Store a contact's public key
export function storeContactPublicKey(userId: string, email: string, publicKey: string): void {
  const contacts = getStoredContacts()
  const existingIndex = contacts.findIndex((c) => c.userId === userId)

  const contact: UserPublicKey = { userId, email, publicKey }

  if (existingIndex >= 0) {
    contacts[existingIndex] = contact
  } else {
    contacts.push(contact)
  }

  localStorage.setItem("contacts_public_keys", JSON.stringify(contacts))
}

// Retrieve all stored contact public keys
export function getStoredContacts(): UserPublicKey[] {
  const stored = localStorage.getItem("contacts_public_keys")
  if (!stored) return []
  return JSON.parse(stored)
}

// Get a specific contact's public key
export function getContactPublicKey(userId: string): string | null {
  const contacts = getStoredContacts()
  const contact = contacts.find((c) => c.userId === userId)
  return contact?.publicKey || null
}

// Convert stored key strings back to CryptoKey objects
export async function getKeyPairObjects(userId: string): Promise<KeyPair | null> {
  const storedKeys = getUserKeys(userId)
  if (!storedKeys) return null

  try {
    const publicKey = await importPublicKey(storedKeys.publicKey)
    const privateKey = await importPrivateKey(storedKeys.privateKey)
    return { publicKey, privateKey }
  } catch (error) {
    console.error("Failed to import stored keys:", error)
    return null
  }
}

// Clear all stored keys (for logout/reset)
export function clearAllKeys(): void {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("keys_") || key === "contacts_public_keys")
  keys.forEach((key) => localStorage.removeItem(key))
}
