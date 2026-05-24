/**
 * FirstFire Welcome Screen Component
 */

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
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
            background: "#ef4444",
            boxShadow: "0 0 12px #ef4444",
            animation: "pulse 2s infinite",
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
          Getting Started
        </span>
      </div>

      {/* Main Content */}
      <h1
        style={{
          margin: "0 0 1rem 0",
          fontSize: "3.5rem",
          lineHeight: 1,
          color: "white",
          fontWeight: 800,
          background:
            "linear-gradient(135deg, #fff 0%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        FirstFire 🔥
      </h1>

      <h2
        style={{
          marginTop: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
          color: "#60a5fa",
          fontWeight: 600,
        }}
      >
        Welcome to Home Assistant Setup
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "1rem",
          lineHeight: 1.8,
          marginBottom: "1.5rem",
        }}
      >
        FirstFire is your AI-powered guide to getting started with Home Assistant.
      </p>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "1rem",
          lineHeight: 1.8,
          marginBottom: "2rem",
        }}
      >
        To unlock AI features, you'll need an OpenAI API token. It's simple, quick, and free (you only pay for API usage).
      </p>

      {/* Feature List */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <p style={{ margin: "0 0 1rem 0", color: "#e2e8f0", fontWeight: 600 }}>
          What you can do:
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.5rem",
            color: "#cbd5e1",
            lineHeight: 1.8,
          }}
        >
          <li>🤖 Ask AI for setup help</li>
          <li>💡 Get smart configuration suggestions</li>
          <li>🎯 Follow guided integration setup</li>
          <li>❓ Get instant answers to your questions</li>
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "1rem",
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"
          ;(e.target as HTMLButtonElement).style.boxShadow =
            "0 15px 35px rgba(239, 68, 68, 0.4)"
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(0)"
          ;(e.target as HTMLButtonElement).style.boxShadow =
            "0 10px 25px rgba(239, 68, 68, 0.3)"
        }}
      >
        Let's Get Started
      </button>

      <p
        style={{
          marginTop: "1.5rem",
          color: "#64748b",
          fontSize: "0.85rem",
          textAlign: "center",
        }}
      >
        Don't worry, you can add your API token in just one step.
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
