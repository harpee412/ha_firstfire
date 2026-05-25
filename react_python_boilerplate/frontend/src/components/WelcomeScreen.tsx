/**
 * FirstFire Welcome Screen Component
 * Cyberpunk smart-home onboarding experience
 */

interface WelcomeScreenProps {
  onStart: () => void
}

const FEATURES = [
  {
    emoji: "🤖",
    title: "AI Guidance",
    description:
      "Conversational onboarding powered by intelligent automation flows.",
    tag: "SMART",
  },
  {
    emoji: "⚡",
    title: "Automation Engine",
    description:
      "Build advanced Home Assistant routines without YAML pain.",
    tag: "LIVE",
  },
  {
    emoji: "🏠",
    title: "Home Intelligence",
    description:
      "Monitor, control, and optimize your smart home ecosystem.",
    tag: "REALTIME",
  },
  {
    emoji: "🔐",
    title: "Secure Token Setup",
    description:
      "Direct OpenAI integration with encrypted local configuration.",
    tag: "SECURE",
  },
]

export default function WelcomeScreen({
  onStart,
}: WelcomeScreenProps) {
  return (
    <div className="page-container">
      {/* HERO */}
      <section
        className="cyber-panel"
        style={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-250px",
            left: "-250px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,61,113,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Status Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div className="section-title">
            Smart Home Intelligence Platform
          </div>

          <div className="status-badge status-online">
            ● SYSTEM READY
          </div>
        </div>

        {/* Main Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxWidth: "1200px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(4rem, 12vw, 8rem)",
              lineHeight: 0.92,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            <span className="glow-text">
              FirstFire
            </span>

            <br />

            <span
              style={{
                color: "var(--text)",
              }}
            >
              AI Home Control
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.9,
              color: "var(--text-muted)",
              maxWidth: "900px",
            }}
          >
            Transform your Home Assistant setup
            into an intelligent automation system.
            Configure OpenAI-powered workflows,
            smart routines, device orchestration,
            and conversational home intelligence —
            all from a modern cyberpunk command
            center.
          </p>
        </div>

        {/* Feature Grid */}
        <div
          className="auto-grid"
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="cyber-card"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                  }}
                >
                  {feature.emoji}
                </div>

                <div className="badge badge-live">
                  {feature.tag}
                </div>
              </div>

              <div className="cyber-card-title">
                {feature.title}
              </div>

              <div className="cyber-card-text">
                {feature.description}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal Block */}
        <div
          className="terminal-block"
          style={{
            marginTop: "1rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="terminal-text">
            &gt; Initializing AI automation
            environment...
            <br />
            &gt; Connecting Home Assistant
            services...
            <br />
            &gt; Preparing onboarding
            sequence...
            <br />
            <span
              style={{
                color: "var(--accent)",
              }}
            >
              &gt; SYSTEM READY
            </span>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <button
            onClick={onStart}
            className="cyber-button cyber-button-primary"
            style={{
              maxWidth: "340px",
            }}
          >
            ⚡ Launch Onboarding
          </button>

          <button
            className="cyber-button cyber-button-secondary"
            style={{
              maxWidth: "260px",
            }}
          >
            📡 View Capabilities
          </button>
        </div>
      </section>
    </div>
  )
}