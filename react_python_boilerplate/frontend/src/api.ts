/**
 * FirstFire API Client
 * Handles all communication with the backend
 */

import {
  ApiResponse,
  ConfigStatus,
  ChatRequest,
  ChatResponse,
  ValidationResponse,
  OpenAIModel,
} from "./types"

// Detect Home Assistant ingress proxy context
// In HA ingress, window.location.pathname is something like: /api/addons/abc123/proxy/
// API calls should use relative paths that the proxy will route to the backend
const getAPIBase = (): string => {
  const path = window.location.pathname

  // Home Assistant ingress proxy pattern: /api/addons/{addon_id}/proxy
  // In this context, relative paths go directly to the backend (no /api prefix needed)
  if (path.includes("/api/addons/") && path.includes("/proxy")) {
    // Running in Home Assistant ingress - use relative path without /api prefix
    return ""
  }

  // Local development - use ./api prefix
  return "./api"
}

const API_BASE = getAPIBase()

/**
 * Generic API call handler
 */
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Construct URL - handle both with and without API_BASE prefix
  let url: string
  if (API_BASE === "") {
    // Home Assistant ingress context - endpoint is relative path from /api/addons/{id}/proxy/
    url = `/api${endpoint}`
  } else {
    // Local development or absolute path
    url = `${API_BASE}${endpoint}`
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      }
    }

    const data = await response.json()
    return data as ApiResponse<T>
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: `Network error: ${message}`,
      },
    }
  }
}

/**
 * Check API health
 */
export async function checkHealth() {
  return apiCall("/health")
}

/**
 * Get current configuration status
 */
export async function getConfigStatus(): Promise<ApiResponse<ConfigStatus>> {
  return apiCall<ConfigStatus>("/config/status")
}

/**
 * Initialize/save OpenAI configuration
 */
export async function initConfig(
  token: string,
  model?: string,
  max_tokens?: number
): Promise<ApiResponse<{ message: string; status: ConfigStatus }>> {
  return apiCall(
    "/config/init",
    {
      method: "POST",
      body: JSON.stringify({
        openai_token: token,
        model: model || "gpt-4-turbo",
        max_tokens: max_tokens || 500,
      }),
    }
  )
}

/**
 * Validate OpenAI token without storing it
 */
export async function validateToken(
  token: string
): Promise<ApiResponse<ValidationResponse>> {
  return apiCall(
    "/validate-token",
    {
      method: "POST",
      body: JSON.stringify({
        openai_token: token,
      }),
    }
  )
}

/**
 * Get available OpenAI models
 */
export async function getModels(): Promise<
  ApiResponse<{ models: OpenAIModel[] }>
> {
  return apiCall("/models")
}

/**
 * Send chat message and get AI response
 */
export async function sendChat(
  message: string,
  conversationId?: string
): Promise<ApiResponse<ChatResponse>> {
  return apiCall(
    "/chat",
    {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      } as ChatRequest),
    }
  )
}

/**
 * Storage utilities for localStorage management
 */
export const Storage = {
  TOKEN_KEY: "firstfire_openai_token",
  CONFIG_KEY: "firstfire_config",
  CONVERSATIONS_KEY: "firstfire_conversations",

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  },

  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY)
  },

  saveConfig(config: ConfigStatus) {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config))
  },

  getConfig(): ConfigStatus | null {
    const stored = localStorage.getItem(this.CONFIG_KEY)
    return stored ? JSON.parse(stored) : null
  },

  clearConfig() {
    localStorage.removeItem(this.CONFIG_KEY)
  },

  clear() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.CONFIG_KEY)
    localStorage.removeItem(this.CONVERSATIONS_KEY)
  },
}
