/**
 * FirstFire Welcome Screen Component
 * Valheim-inspired Norse aesthetic
 */

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
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
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background texture/pattern */}
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
          maxHeight: "90vh",
          background: "linear-gradient(135deg, rgba(61, 34, 20, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)",
          border: "3px solid #8b5a2b",
          borderRadius: "8px",
          padding: "4rem 3rem",
          boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 0 60px rgba(139, 90, 43, 0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "900px",
          position: "relative",
          zIndex: 1,
          overflow: "auto",
        }}
      >
        {/* Runic border top */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#c19a6b",
            fontSize: "1.2rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚠ ᚢ ᚦ ᚨ ᚱ
        </div>

        {/* Main Content */}
        <h1
          style={{
            margin: "0 0 1rem 0",
            fontSize: "4rem",
            lineHeight: 1,
            color: "#d4af37",
            fontWeight: 800,
            textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.3)",
            textAlign: "center",
          }}
        >
          FirstFire 🔥
        </h1>

        <h2
          style={{
            marginTop: "0.5rem",
            marginBottom: "2rem",
            fontSize: "1.8rem",
            color: "#c19a6b",
            fontWeight: 600,
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          Kindle Your Home Assistant Journey
        </h2>

        <p
          style={{
            color: "#d9ccc3",
            fontSize: "1.1rem",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Ignite the flame of automation. FirstFire guides you through the ancient art of Home Assistant mastery.
        </p>

        <p
          style={{
            color: "#d9ccc3",
            fontSize: "1.1rem",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
          Awaken the AI spirit with an OpenAI token. Simple. Powerful. Free (pay only for what you burn).
        </p>

        {/* Feature List */}
        <div
          style={{
            background: "rgba(45, 24, 16, 0.6)",
            border: "2px solid #8b5a2b",
            borderRadius: "6px",
            padding: "2rem",
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 1.5rem 0", color: "#d4af37", fontWeight: 700, fontSize: "1.2rem" }}>
            What the flame reveals:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ color: "#d9ccc3", lineHeight: 1.8 }}>
              <div>🤖 AI Guidance</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Setup wisdom from the spirits</div>
            </div>
            <div style={{ color: "#d9ccc3", lineHeight: 1.8 }}>
              <div>💡 Smart Paths</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Configuration enlightenment</div>
            </div>
            <div style={{ color: "#d9ccc3", lineHeight: 1.8 }}>
              <div>🎯 Quest Guide</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Step-by-step integration</div>
            </div>
            <div style={{ color: "#d9ccc3", lineHeight: 1.8 }}>
              <div>❓ Oracle Answers</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Instant mystical knowledge</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
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
            (e.target as HTMLButtonElement).style.transform = "translateY(-3px)"
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 12px 30px rgba(200, 74, 26, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)"
            ;(e.target as HTMLButtonElement).style.background =
              "linear-gradient(135deg, #d45a2a 0%, #9b4a1a 100%)"
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = "translateY(0)"
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 8px 20px rgba(200, 74, 26, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
            ;(e.target as HTMLButtonElement).style.background =
              "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)"
          }}
        >
          IGNITE THE FLAME ⚔️
        </button>

        <p
          style={{
            marginTop: "2rem",
            color: "#a89678",
            fontSize: "0.95rem",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          The token is but one step. Fear not, brave pioneer.
        </p>

        {/* Runic border bottom */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#c19a6b",
            fontSize: "1.2rem",
            letterSpacing: "0.3em",
            opacity: 0.7,
          }}
        >
          ᚠ ᚢ ᚦ ᚨ ᚱ
        </div>
      </div>

      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
