/**
 * FirstFire Confirmation Screen Component
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
            background: "#22c55e",
            boxShadow: "0 0 12px #22c55e",
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
          Ready to Go
        </span>
      </div>

      {/* Success Icon */}
      <div
        style={{
          fontSize: "4rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        ✨
      </div>

      {/* Title */}
      <h1
        style={{
          margin: "0 0 1rem 0",
          fontSize: "2.5rem",
          lineHeight: 1,
          color: "white",
          fontWeight: 800,
          textAlign: "center",
        }}
      >
        All Set!
      </h1>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "1rem",
          lineHeight: 1.8,
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        Your OpenAI configuration is ready. Let's start exploring Home Assistant!
      </p>

      {/* Configuration Display */}
      {configStatus && (
        <div
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              margin: "0 0 1rem 0",
              color: "#94a3b8",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Configuration
          </p>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <p
                style={{
                  margin: "0 0 0.25rem 0",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Model
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#60a5fa",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {configStatus.model}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 0.25rem 0",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Max Tokens
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#60a5fa",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {configStatus.max_tokens}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 0.25rem 0",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                API Token
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#22c55e",
                  fontSize: "1rem",
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
            padding: "1rem",
            background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.transform =
              "translateY(-2px)"
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 15px 35px rgba(239, 68, 68, 0.4)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 10px 25px rgba(239, 68, 68, 0.3)"
          }}
        >
          Start Chatting with AI
        </button>

        <button
          onClick={onBack}
          style={{
            padding: "1rem",
            background: "rgba(148, 163, 184, 0.1)",
            color: "#cbd5e1",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.background =
              "rgba(148, 163, 184, 0.15)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.background =
              "rgba(148, 163, 184, 0.1)"
          }}
        >
          Change Token
        </button>
      </div>
    </div>
  )
}
