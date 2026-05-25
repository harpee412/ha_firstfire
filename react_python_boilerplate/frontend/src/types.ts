/**
 * FirstFire TypeScript Type Definitions
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface ConfigStatus {
  configured: boolean
  model: string
  max_tokens: number
  openai_token_masked?: string
}

export interface ChatRequest {
  message: string
  conversation_id?: string
}

export interface ChatResponse {
  response: string
  tokens_used: number
  model: string
  agent?: string
  router_selected?: string
  conversation_id?: string
}

export interface ValidationResponse {
  valid: boolean
  error?: string
}

export interface OpenAIModel {
  id: string
  name: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  tokens_used?: number
}

export interface Conversation {
  id: string
  messages: Message[]
  created_at: number
  updated_at: number
}

export type OnboardingStep = "welcome" | "setup" | "confirmation" | "chat"
