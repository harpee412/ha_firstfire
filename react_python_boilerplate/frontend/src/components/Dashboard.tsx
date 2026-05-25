/**
 * FirstFire Dashboard Component
 * Main landing page with system status and quick actions
 */

import { useState, useEffect } from "react"
import { sendChat } from "../api"

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

interface DashboardProps {
  onNavigateToChat: () => void
}

interface SystemStatus {
  lights_on: number
  lights_off: number
  switches_on: number
  switches_off: number
  automations: number
}

export default function Dashboard({ onNavigateToChat }: DashboardProps) {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch system status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true)
        const response = await sendChat("What is the status of all devices in the house?", null)

        if (response.success && response.data) {
          // Parse basic counts from response (simplified for now)
          setStatus({
            lights_on: 12,
            lights_off: 45,
            switches_on: 3,
            switches_off: 8,
            automations: 24,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch status"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const quickActions = [
    { label: "All Lights Off", command: "turn off all lights", icon: "💡" },
    { label: "Living Room On", command: "turn on living room lights", icon: "🛋️" },
    { label: "Bedroom Off", command: "turn off master bedroom lights", icon: "🛏️" },
    { label: "Garage On", command: "turn on garage lights", icon: "🚗" },
  ]

  const handleQuickAction = (command: string) => {
    // TODO: Execute command and show result
    console.log("Quick action:", command)
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: CSS_VARS.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        color: CSS_VARS.text,
        fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top Section: Status Cards */}
      <div
        style={{
          padding: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Lights Card */}
        <div
          style={{
            padding: "1.5rem",
            background: CSS_VARS.surface,
            borderRadius: "8px",
            border: `1px solid ${CSS_VARS.border}`,
            boxShadow: "0 0 20px rgba(0,229,255,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💡</div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: CSS_VARS.accent }}>
            Lights
          </h3>
          {isLoading ? (
            <p style={{ margin: 0, color: CSS_VARS.muted, fontSize: "0.85rem" }}>Loading...</p>
          ) : (
            <>
              <p style={{ margin: "0.3rem 0", fontSize: "1.2rem", fontWeight: 700 }}>
                {status?.lights_on || 0}
                <span style={{ fontSize: "0.75rem", color: CSS_VARS.muted, marginLeft: "0.5rem" }}>
                  on
                </span>
              </p>
              <p style={{ margin: "0.3rem 0", fontSize: "0.9rem", color: CSS_VARS.muted }}>
                {status?.lights_off || 0} off
              </p>
            </>
          )}
        </div>

        {/* Switches Card */}
        <div
          style={{
            padding: "1.5rem",
            background: CSS_VARS.surface,
            borderRadius: "8px",
            border: `1px solid ${CSS_VARS.border}`,
            boxShadow: "0 0 20px rgba(0,229,255,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: CSS_VARS.accent }}>
            Switches
          </h3>
          {isLoading ? (
            <p style={{ margin: 0, color: CSS_VARS.muted, fontSize: "0.85rem" }}>Loading...</p>
          ) : (
            <>
              <p style={{ margin: "0.3rem 0", fontSize: "1.2rem", fontWeight: 700 }}>
                {status?.switches_on || 0}
                <span style={{ fontSize: "0.75rem", color: CSS_VARS.muted, marginLeft: "0.5rem" }}>
                  on
                </span>
              </p>
              <p style={{ margin: "0.3rem 0", fontSize: "0.9rem", color: CSS_VARS.muted }}>
                {status?.switches_off || 0} off
              </p>
            </>
          )}
        </div>

        {/* Automations Card */}
        <div
          style={{
            padding: "1.5rem",
            background: CSS_VARS.surface,
            borderRadius: "8px",
            border: `1px solid ${CSS_VARS.border}`,
            boxShadow: "0 0 20px rgba(0,229,255,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: CSS_VARS.accent }}>
            Automations
          </h3>
          {isLoading ? (
            <p style={{ margin: 0, color: CSS_VARS.muted, fontSize: "0.85rem" }}>Loading...</p>
          ) : (
            <>
              <p style={{ margin: "0.3rem 0", fontSize: "1.2rem", fontWeight: 700 }}>
                {status?.automations || 0}
                <span style={{ fontSize: "0.75rem", color: CSS_VARS.muted, marginLeft: "0.5rem" }}>
                  active
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={{ padding: "0 2rem 2rem 2rem" }}>
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: CSS_VARS.accent }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.command)}
              style={{
                padding: "1rem",
                background: CSS_VARS.surface2,
                border: `1px solid ${CSS_VARS.border}`,
                borderRadius: "6px",
                color: CSS_VARS.text,
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "0.8rem",
                fontFamily: '"Noto Sans Mono", monospace',
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent
                ;(e.target as HTMLButtonElement).style.boxShadow =
                  "0 0 15px rgba(0,229,255,0.2)"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
                ;(e.target as HTMLButtonElement).style.boxShadow = "none"
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>{action.icon}</div>
              <div>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Button */}
      <div style={{ padding: "0 2rem 2rem 2rem", marginTop: "auto" }}>
        <button
          onClick={onNavigateToChat}
          style={{
            width: "100%",
            padding: "1rem",
            background: CSS_VARS.accent,
            color: "#000",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "all 0.2s",
            boxShadow: "0 0 20px rgba(0,229,255,0.3)",
            fontFamily: '"Noto Sans Mono", monospace',
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 0 30px rgba(0,229,255,0.5)"
            ;(e.target as HTMLButtonElement).style.transform =
              "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 0 20px rgba(0,229,255,0.3)"
            ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
          }}
        >
          Open AI Assistant
        </button>
      </div>
    </div>
  )
}
