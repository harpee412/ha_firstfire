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

// Clean up service workers that might be caching old routes
const cleanupServiceWorkers = async () => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      // Unregister old service workers that might be interfering
      await registration.unregister()
      console.log("Unregistered service worker:", registration.scope)
    }
  } catch (e) {
    console.log("No service workers to clean up")
  }
}

// Run cleanup on load
if ("serviceWorker" in navigator) {
  cleanupServiceWorkers()
}

// Detect API base URL - works for both local dev and HA ingress
const getAPIBase = (): string => {
  const path = window.location.pathname
  const hostname = window.location.hostname

  console.log("🔥 FirstFire API Config:", {
    pathname: path,
    hostname,
    href: window.location.href,
  })

  // Home Assistant Nabu Casa detection
  if (hostname.includes("nabu.casa") || hostname.includes("local.hass.io")) {
    // Nabu Casa Cloud uses ingress at a specific path
    // Just use relative paths that will be routed through the proxy
    console.log("🔥 Detected Home Assistant Cloud/Local")
    return "."
  }

  // Home Assistant ingress proxy pattern: /api/addons/{addon_id}/proxy
  if (path.includes("/api/addons/") && path.includes("/proxy")) {
    console.log("🔥 Detected Home Assistant ingress proxy")
    return "."
  }

  // Local development
  console.log("🔥 Detected local development")
  return "./api"
}

const API_BASE = getAPIBase()

/**
 * Generic API call handler with comprehensive error handling
 */
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Construct URL
  const url = `${API_BASE}/api${endpoint}`

  console.log(`🔥 API Call: ${options.method || "GET"} ${url}`)

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const contentType = response.headers.get("content-type")

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      if (contentType?.includes("application/json")) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch (e) {
          // Response wasn't JSON, use default message
        }
      }

      console.error(`🔥 API Error [${response.status}]:`, errorMessage)

      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorMessage,
        },
      }
    }

    // Only try to parse JSON if content-type indicates it
    if (!contentType?.includes("application/json")) {
      console.warn(`🔥 Non-JSON response from ${url}:`, contentType)
      return {
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Backend returned non-JSON response",
        },
      }
    }

    const data = await response.json()
    console.log(`🔥 API Success [${response.status}]:`, endpoint)
    return data as ApiResponse<T>
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`🔥 API Network Error:`, message)

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
 * Get InfluxDB status
 */
export async function getInfluxDBStatus(): Promise<ApiResponse<any>> {
  return apiCall("/influxdb/status")
}

/**
 * Configure InfluxDB connection
 */
export async function configureInfluxDB(config: {
  url: string
  token: string
  org?: string
  bucket?: string
  username?: string
  use_v1?: boolean
}): Promise<ApiResponse<any>> {
  return apiCall("/influxdb/config", {
    method: "POST",
    body: JSON.stringify(config),
  })
}

/**
 * Test InfluxDB connection
 */
export async function testInfluxDBConnection(): Promise<ApiResponse<any>> {
  return apiCall("/influxdb/test", {
    method: "POST",
  })
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
