/**
 * FirstFire Confirmation Screen Component
 * Valheim-inspired design
 */

import { ConfigStatus } from "../types"

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
          textAlign: "center",
        }}
      >
        {/* Runic border top */}
        <div
          style={{
            marginBottom: "2rem",
            color: "#c19a6b",
            fontSize: "1.1rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚠ ᛁ ᚱ ᛖ 🔥
        </div>

        {/* Success Icon */}
        <div
          style={{
            fontSize: "5rem",
            marginBottom: "1.5rem",
          }}
        >
          ⚔️
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 1.5rem 0",
            fontSize: "3rem",
            lineHeight: 1,
            color: "#d4af37",
            fontWeight: 800,
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          The Ritual Complete
        </h1>

        <p
          style={{
            color: "#d9ccc3",
            fontSize: "1.1rem",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
          }}
        >
          The spirits are bound. Your oracle awaits. The path to mastery lies before you.
        </p>

        {/* Configuration Display */}
        {configStatus && (
          <div
            style={{
              background: "rgba(45, 24, 16, 0.6)",
              border: "2px solid #8b5a2b",
              borderRadius: "6px",
              padding: "2rem",
              marginBottom: "2.5rem",
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 1.5rem 0",
                color: "#d4af37",
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Your Covenant
            </p>

            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    color: "#c19a6b",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Oracle Spirit
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#ffd700",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  {configStatus.model}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 0.4rem 0",
                    color: "#c19a6b",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Response Breath
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#ffd700",
                    fontSize: "1.1rem",
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
                    color: "#c19a6b",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Sacred Seal
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#a8a878",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    fontFamily: "monospace",
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
              padding: "1.2rem 2rem",
              background: "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)",
              color: "#ffd700",
              border: "2px solid #d4af37",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 20px rgba(200, 74, 26, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.transform =
                "translateY(-3px)"
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 12px 30px rgba(200, 74, 26, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)"
              ;(e.target as HTMLButtonElement).style.background =
                "linear-gradient(135deg, #d45a2a 0%, #9b4a1a 100%)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 8px 20px rgba(200, 74, 26, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
              ;(e.target as HTMLButtonElement).style.background =
                "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)"
            }}
          >
            ENTER THE REALM 🎯
          </button>

          <button
            onClick={onBack}
            style={{
              padding: "1rem",
              background: "rgba(139, 90, 43, 0.2)",
              color: "#c19a6b",
              border: "2px solid #8b5a2b",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(139, 90, 43, 0.4)"
              ;(e.target as HTMLButtonElement).style.borderColor = "#c19a6b"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(139, 90, 43, 0.2)"
              ;(e.target as HTMLButtonElement).style.borderColor = "#8b5a2b"
            }}
          >
            Reconsider Seal
          </button>
        </div>

        {/* Runic border bottom */}
        <div
          style={{
            marginTop: "2rem",
            color: "#c19a6b",
            fontSize: "1.1rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚠ ᛁ ᚱ ᛖ 🔥
        </div>
      </div>
    </div>
  )
}
