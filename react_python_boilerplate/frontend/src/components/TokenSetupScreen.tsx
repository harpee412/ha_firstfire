/**
 * FirstFire Token Setup Screen Component
 */

import { useState } from "react"
import { validateToken } from "../api"

interface TokenSetupScreenProps {
  onTokenSaved: (token: string) => void
  isLoading: boolean
  error?: string | null
}

export default function TokenSetupScreen({
  onTokenSaved,
  isLoading,
  error,
}: TokenSetupScreenProps) {
  const [token, setToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
    setValidationError(null)
  }

  const handleValidate = async () => {
    if (!token.trim()) {
      setValidationError("Please enter your API token")
      return
    }

    setIsValidating(true)
    const response = await validateToken(token)

    if (response.success && response.data?.valid) {
      setValidationError(null)
      onTokenSaved(token)
    } else {
      setValidationError(
        response.data?.error ||
        response.error?.message ||
        "Token validation failed"
      )
      setIsValidating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleValidate()
  }

  const tokenError = validationError || error

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        background: "rgba(15, 23, 42, 0.85)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: "24px",
        padding: "3rem 2rem",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
      }}
    >
      {/* Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "999px",
            background: "#fbbf24",
            boxShadow: "0 0 12px #fbbf24",
          }}
        />
        <span
          style={{
            color: "#94a3b8",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Setup Your Token
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          margin: "0 0 1rem 0",
          fontSize: "2.5rem",
          lineHeight: 1,
          color: "white",
          fontWeight: 800,
        }}
      >
        API Token
      </h1>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "1rem",
          lineHeight: 1.8,
          marginBottom: "2rem",
        }}
      >
        Enter your OpenAI API token. Get one free at{" "}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            borderBottom: "1px solid #60a5fa",
          }}
        >
          platform.openai.com/api-keys
        </a>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Token Input */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#e2e8f0",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            OpenAI API Token
          </label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={handleTokenChange}
              placeholder="sk-..."
              disabled={isLoading || isValidating}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                paddingRight: "2.5rem",
                background: "rgba(30, 41, 59, 0.8)",
                border: `1px solid ${
                  tokenError
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(148, 163, 184, 0.2)"
                }`,
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                opacity: isLoading || isValidating ? 0.6 : 1,
              }}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              disabled={isLoading || isValidating}
              style={{
                position: "absolute",
                right: "0.75rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: isLoading || isValidating ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                opacity: isLoading || isValidating ? 0.5 : 0.8,
              }}
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {tokenError && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#fca5a5",
              fontSize: "0.95rem",
            }}
          >
            ⚠️ {tokenError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!token.trim() || isLoading || isValidating}
          style={{
            width: "100%",
            padding: "1rem",
            background: !token.trim()
              ? "rgba(59, 130, 246, 0.3)"
              : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: !token.trim() || isLoading || isValidating
              ? "not-allowed"
              : "pointer",
            transition: "all 0.3s ease",
            boxShadow: !token.trim()
              ? "none"
              : "0 10px 25px rgba(59, 130, 246, 0.2)",
          }}
          onMouseEnter={(e) => {
            if (!token.trim() || isLoading || isValidating) return
            ;(e.target as HTMLButtonElement).style.transform =
              "translateY(-2px)"
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 15px 35px rgba(59, 130, 246, 0.3)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
            ;(e.target as HTMLButtonElement).style.boxShadow = token.trim()
              ? "0 10px 25px rgba(59, 130, 246, 0.2)"
              : "none"
          }}
        >
          {isValidating ? "Validating..." : isLoading ? "Setting up..." : "Continue"}
        </button>
      </form>

      {/* Info Box */}
      <div
        style={{
          marginTop: "2rem",
          background: "rgba(6, 78, 59, 0.2)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          borderRadius: "8px",
          padding: "1rem",
          fontSize: "0.85rem",
          color: "#cbd5e1",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: 0 }}>
          ✓ Your token is only stored locally in your browser
        </p>
        <p style={{ margin: "0.5rem 0 0 0" }}>
          ✓ We never store or transmit your token to external servers
        </p>
      </div>
    </div>
  )
}
