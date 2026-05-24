/**
 * FirstFire Token Setup Screen Component
 * Valheim-inspired design
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
      setValidationError("Please inscribe your token rune")
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
        "The rune speaks falsely"
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
        background: "linear-gradient(135deg, #2d1810 0%, #1a0f0a 50%, #0f0606 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 90, 43, 0.03) 2px, rgba(139, 90, 43, 0.03) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 90, 43, 0.03) 2px, rgba(139, 90, 43, 0.03) 4px)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "linear-gradient(135deg, rgba(61, 34, 20, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)",
          border: "3px solid #8b5a2b",
          borderRadius: "8px",
          padding: "3.5rem 3rem",
          boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 0 60px rgba(139, 90, 43, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Runic border top */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#c19a6b",
            fontSize: "1.1rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚦ ᛟ ᚲ ᛖ ᚾ
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 1.5rem 0",
            fontSize: "2.8rem",
            lineHeight: 1,
            color: "#d4af37",
            fontWeight: 800,
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          The Oracle's Token
        </h1>

        <p
          style={{
            color: "#d9ccc3",
            fontSize: "1rem",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
          Inscribe the sacred rune of the OpenAI spirits. Obtain it freely at{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#c19a6b",
              textDecoration: "none",
              borderBottom: "2px solid #c19a6b",
              fontWeight: 600,
            }}
          >
            the Oracle's Chamber
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
                color: "#d4af37",
                fontSize: "1rem",
                fontWeight: 600,
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              Spirit Rune (sk-...)
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
                  padding: "0.9rem 1rem",
                  paddingRight: "2.5rem",
                  background: "rgba(20, 10, 5, 0.8)",
                  border: `2px solid ${
                    tokenError ? "#c84a1a" : "#8b5a2b"
                  }`,
                  borderRadius: "4px",
                  color: "#d9ccc3",
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
                  color: "#c19a6b",
                  cursor: isLoading || isValidating ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  opacity: isLoading || isValidating ? 0.5 : 0.9,
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
                background: "rgba(200, 74, 26, 0.15)",
                border: "2px solid #c84a1a",
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "2rem",
                color: "#e8a76a",
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
              padding: "1.1rem",
              background: !token.trim()
                ? "rgba(139, 90, 43, 0.3)"
                : "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)",
              color: !token.trim() ? "#a89678" : "#ffd700",
              border: `2px solid ${!token.trim() ? "#8b5a2b" : "#d4af37"}`,
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: !token.trim() || isLoading || isValidating
                ? "not-allowed"
                : "pointer",
              transition: "all 0.3s ease",
              boxShadow: !token.trim()
                ? "none"
                : "0 8px 20px rgba(200, 74, 26, 0.3)",
              textShadow: !token.trim() ? "none" : "1px 1px 2px rgba(0,0,0,0.5)",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              if (!token.trim() || isLoading || isValidating) return
              ;(e.target as HTMLButtonElement).style.transform =
                "translateY(-2px)"
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 12px 30px rgba(200, 74, 26, 0.5)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
              ;(e.target as HTMLButtonElement).style.boxShadow = token.trim()
                ? "0 8px 20px rgba(200, 74, 26, 0.3)"
                : "none"
            }}
          >
            {isValidating ? "Testing Rune..." : isLoading ? "Binding Spirit..." : "INSCRIBE & ADVANCE"}
          </button>
        </form>

        {/* Info Box */}
        <div
          style={{
            marginTop: "2.5rem",
            background: "rgba(45, 24, 16, 0.6)",
            border: "2px solid #8b5a2b",
            borderRadius: "4px",
            padding: "1.25rem",
            fontSize: "0.9rem",
            color: "#d9ccc3",
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600, color: "#c19a6b" }}>
            🔐 Sacred Trust
          </p>
          <p style={{ margin: 0 }}>
            Your rune dwells only within your realm. Never sent beyond your walls.
          </p>
        </div>

        {/* Runic border bottom */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#c19a6b",
            fontSize: "1.1rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚦ ᛟ ᚲ ᛖ ᚾ
        </div>
      </div>
    </div>
  )
}
