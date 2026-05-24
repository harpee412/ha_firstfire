/**
 * FirstFire Welcome Screen Component
 * Full-width responsive onboarding landing page
 */

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({
  onStart,
}: WelcomeScreenProps) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #2d1810 0%, #1a0f0a 50%, #0f0606 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        overflowX: "hidden",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 90, 43, 0.03) 2px,
              rgba(139, 90, 43, 0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 90, 43, 0.03) 2px,
              rgba(139, 90, 43, 0.03) 4px
            )
          `,
          pointerEvents: "none",
        }}
      />

      {/* Main Shell */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          padding: "1.5rem",
          border: "3px solid #8b5a2b",
          background:
            "linear-gradient(135deg, rgba(61, 34, 20, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)",
          boxShadow:
            "0 0 60px rgba(0,0,0,0.8), inset 0 0 60px rgba(139, 90, 43, 0.1)",
        }}
      >
        {/* Rune Header */}
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

        {/* Hero */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(4rem, 10vw, 8rem)",
              lineHeight: 1,
              color: "#d4af37",
              fontWeight: 900,
              textShadow:
                "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.3)",
              wordBreak: "break-word",
            }}
          >
            FirstFire 🔥
          </h1>

          <h2
            style={{
              marginTop: "1rem",
              marginBottom: "2rem",
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              color: "#c19a6b",
              fontWeight: 600,
              textShadow:
                "1px 1px 2px rgba(0,0,0,0.6)",
            }}
          >
            Kindle Your Home Assistant Journey
          </h2>

          <p
            style={{
              width: "100%",
              color: "#d9ccc3",
              fontSize: "1.2rem",
              lineHeight: 1.8,
              marginBottom: "1.5rem",
            }}
          >
            Ignite the flame of automation. FirstFire
            guides you through the ancient art of Home
            Assistant mastery.
          </p>

          <p
            style={{
              width: "100%",
              color: "#d9ccc3",
              fontSize: "1.2rem",
              lineHeight: 1.8,
              marginBottom: "3rem",
            }}
          >
            Awaken the AI spirit with an OpenAI token.
            Simple. Powerful. Free (pay only for what
            you burn).
          </p>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            width: "100%",
            background: "rgba(45, 24, 16, 0.6)",
            border: "2px solid #8b5a2b",
            borderRadius: "10px",
            padding: "2rem",
            marginBottom: "3rem",
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              margin: "0 0 2rem 0",
              color: "#d4af37",
              fontWeight: 700,
              fontSize: "1.8rem",
              textAlign: "center",
            }}
          >
            What the flame reveals:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
              width: "100%",
            }}
          >
            {[
              {
                title: "🤖 AI Guidance",
                desc: "Setup wisdom from the spirits",
              },
              {
                title: "💡 Smart Paths",
                desc: "Configuration enlightenment",
              },
              {
                title: "🎯 Quest Guide",
                desc: "Step-by-step integration",
              },
              {
                title: "❓ Oracle Answers",
                desc: "Instant mystical knowledge",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  color: "#d9ccc3",
                  lineHeight: 1.8,
                  textAlign: "center",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </div>

                <div
                  style={{
                    fontSize: "1rem",
                    opacity: 0.8,
                  }}
                >
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          style={{
            width: "100%",
            padding: "1.5rem 2rem",
            background:
              "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)",
            color: "#ffd700",
            border: "2px solid #d4af37",
            borderRadius: "6px",
            fontSize: "1.3rem",
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              "0 8px 20px rgba(200,74,26,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            textShadow:
              "1px 1px 2px rgba(0,0,0,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          IGNITE THE FLAME ⚔️
        </button>

        {/* Footer */}
        <p
          style={{
            marginTop: "2rem",
            color: "#a89678",
            fontSize: "1rem",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          The token is but one step. Fear not,
          brave pioneer.
        </p>

        {/* Rune Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "3rem",
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
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}