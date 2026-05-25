/**
 * FirstFire Confirmation Screen Component
 * Cyberpunk/Sci-Fi Design
 */

import { ConfigStatus } from "../types"

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

interface ConfirmationScreenProps {
  configStatus: ConfigStatus | null
  onContinue: () => void
  onBack: () => void
}

export default function ConfirmationScreen({
  configStatus,
  onContinue,
  onBack,
}: ConfirmationScreenProps) {
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
      }}
    >
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
          textAlign: "center",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1.5rem",
          }}
        >
          🔥
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 1rem 0",
            fontSize: "2.2rem",
            lineHeight: 1,
            color: CSS_VARS.accent,
            fontWeight: 800,
            textShadow: `0 0 20px rgba(0,229,255,0.25)`,
            letterSpacing: "0.05em",
          }}
        >
          Ready to Ignite
        </h1>

        <p
          style={{
            color: CSS_VARS.text,
            fontSize: "1rem",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
            opacity: 0.9,
          }}
        >
          Your FirstFire is configured. Start automating your home with intelligence.
        </p>

        {/* Configuration Display */}
        {configStatus && (
          <div
            style={{
              background: CSS_VARS.surface2,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "8px",
              padding: "2rem",
              marginBottom: "2.5rem",
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 1.5rem 0",
                color: CSS_VARS.accent,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Configuration Status
            </p>

            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    color: CSS_VARS.muted,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                  }}
                >
                  AI Model
                </p>
                <p
                  style={{
                    margin: 0,
                    color: CSS_VARS.accent3,
                    fontSize: "1rem",
                    fontWeight: 600,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {configStatus.model}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    color: CSS_VARS.muted,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                  }}
                >
                  Response Length
                </p>
                <p
                  style={{
                    margin: 0,
                    color: CSS_VARS.accent,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {configStatus.max_tokens} tokens
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    color: CSS_VARS.muted,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                  }}
                >
                  API Key
                </p>
                <p
                  style={{
                    margin: 0,
                    color: CSS_VARS.accent2,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {configStatus.openai_token_masked}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "grid", gap: "1rem" }}>
          <button
            onClick={onContinue}
            style={{
              padding: "1rem 2rem",
              background: CSS_VARS.accent,
              color: "#000",
              border: `2px solid ${CSS_VARS.accent}`,
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 0 20px rgba(0,229,255,0.3)`,
            }}
            onMouseEnter={(e) => {
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
            Start Your First Fire
          </button>

          <button
            onClick={onBack}
            style={{
              padding: "0.85rem 2rem",
              background: "transparent",
              color: CSS_VARS.muted,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent2
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent2
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.muted
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
