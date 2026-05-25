/**
 * FirstFire Token Setup Screen Component
 * Cyberpunk/Sci-Fi Design with Noto Font
 */

import { useState } from "react"
import { validateToken } from "../api"

interface TokenSetupScreenProps {
  onTokenSaved: (token: string) => void
  isLoading: boolean
  error?: string | null
}

const CSS_VARS = {
  bg: "#0a0c10",
  surface: "#111420",
  surface2: "#181d2e",
  border: "#1e2540",
  accent: "#00e5ff",
  accent2: "#ff3d71",
  accent3: "#39ff14",
  text: "#e8eaf6",
  muted: "#5c6394",
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
      setValidationError("Please enter your API key")
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
        "Invalid API key"
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
        width: "100vw",
        height: "100vh",
        background: CSS_VARS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
        position: "relative",
        fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;800&family=Noto+Sans+Mono:wght@400;600&display=swap');
      `}</style>
      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,229,255,0.015) 2px,
            rgba(0,229,255,0.015) 4px
          )`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: CSS_VARS.surface,
          border: `1px solid ${CSS_VARS.border}`,
          borderRadius: "12px",
          padding: "3rem",
          boxShadow: `0 0 40px rgba(0,229,255,0.1)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "2.2rem",
            lineHeight: 1,
            color: CSS_VARS.accent,
            fontWeight: 800,
            textShadow: `0 0 20px rgba(0,229,255,0.25)`,
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          Ignite Your Intelligence
        </h1>

        <p
          style={{
            color: CSS_VARS.text,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          Add your OpenAI API key to enable AI-powered home automation. Get one free at{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: CSS_VARS.accent,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            platform.openai.com
          </a>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Token Input */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                color: CSS_VARS.muted,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              API Key
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
                  padding: "0.85rem 1rem",
                  paddingRight: "2.5rem",
                  background: CSS_VARS.surface2,
                  border: `1px solid ${
                    tokenError ? CSS_VARS.accent2 : CSS_VARS.border
                  }`,
                  borderRadius: "6px",
                  color: CSS_VARS.text,
                  fontSize: "0.9rem",
                  fontFamily: "'Noto Sans Mono', monospace",
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
                  color: CSS_VARS.muted,
                  cursor: isLoading || isValidating ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
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
                background: "rgba(255, 61, 113, 0.1)",
                border: `1px solid ${CSS_VARS.accent2}`,
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "2rem",
                color: CSS_VARS.accent2,
                fontSize: "0.9rem",
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
              padding: "1rem 2rem",
              background: !token.trim()
                ? `rgba(0,229,255,0.1)`
                : CSS_VARS.accent,
              color: !token.trim() ? CSS_VARS.muted : "#000",
              border: `2px solid ${!token.trim() ? CSS_VARS.border : CSS_VARS.accent}`,
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: !token.trim() || isLoading || isValidating
                ? "not-allowed"
                : "pointer",
              transition: "all 0.2s",
              boxShadow: !token.trim()
                ? "none"
                : `0 0 20px rgba(0,229,255,0.3)`,
            }}
            onMouseEnter={(e) => {
              if (!token.trim() || isLoading || isValidating) return
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 0 30px rgba(0,229,255,0.6)"
              ;(e.target as HTMLButtonElement).style.transform =
                "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 0 20px rgba(0,229,255,0.3)"
              ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
            }}
          >
            {isValidating ? "Validating..." : isLoading ? "Configuring..." : "Start Your First Fire"}
          </button>
        </form>

        {/* Info Box */}
        <div
          style={{
            marginTop: "2.5rem",
            background: CSS_VARS.surface2,
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            padding: "1.25rem",
            fontSize: "0.85rem",
            color: CSS_VARS.text,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600, color: CSS_VARS.accent }}>
            🔐 Your Privacy
          </p>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Your API key is stored securely and never transmitted outside your Home Assistant instance.
          </p>
        </div>
      </div>
    </div>
  )
}
