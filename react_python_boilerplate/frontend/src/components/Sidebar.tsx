/**
 * FirstFire Sidebar Navigation Component
 * Left sidebar with navigation and branding
 */

interface SidebarProps {
  currentPage: "dashboard" | "chat" | "settings"
  onNavigate: (page: "dashboard" | "chat" | "settings") => void
  onSettings: () => void
  onLogout: () => void
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

export default function Sidebar({
  currentPage,
  onNavigate,
  onSettings,
  onLogout,
}: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "chat", label: "AI Assistant", icon: "💬" },
  ]

  return (
    <div
      style={{
        width: "240px",
        height: "100vh",
        background: CSS_VARS.surface,
        borderRight: `1px solid ${CSS_VARS.border}`,
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 50,
        overflow: "hidden",
        fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Branding Section */}
      <div
        style={{
          padding: "1.5rem 1rem",
          borderBottom: `1px solid ${CSS_VARS.border}`,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #00e5ff 0%, #0077ff 100%)",
            boxShadow: "0 0 15px rgba(0,229,255,0.3)",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          🔥
        </div>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "0.9rem",
              fontWeight: 800,
              color: CSS_VARS.accent,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            FirstFire
          </h2>
          <p
            style={{
              margin: 0,
              marginTop: "0.1rem",
              fontSize: "0.6rem",
              color: CSS_VARS.muted,
              letterSpacing: "0.05em",
            }}
          >
            Home Assistant
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav
        style={{
          flex: 1,
          padding: "1rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as "dashboard" | "chat")}
            style={{
              padding: "0.75rem 1rem",
              background:
                currentPage === item.id
                  ? `rgba(0,229,255,0.1)`
                  : "transparent",
              border:
                currentPage === item.id
                  ? `1px solid ${CSS_VARS.accent}`
                  : "1px solid transparent",
              borderRadius: "6px",
              color: currentPage === item.id ? CSS_VARS.accent : CSS_VARS.text,
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: currentPage === item.id ? 600 : 500,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontFamily: '"Noto Sans Mono", monospace',
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(0,229,255,0.05)"
                ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                ;(e.target as HTMLButtonElement).style.background =
                  "transparent"
                ;(e.target as HTMLButtonElement).style.color = CSS_VARS.text
              }
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div
        style={{
          padding: "1rem 0.5rem",
          borderTop: `1px solid ${CSS_VARS.border}`,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => onNavigate("settings")}
          style={{
            padding: "0.65rem 1rem",
            background: currentPage === "settings" ? `rgba(0,229,255,0.1)` : "transparent",
            border: currentPage === "settings" ? `1px solid ${CSS_VARS.accent}` : `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            color: currentPage === "settings" ? CSS_VARS.accent : CSS_VARS.muted,
            cursor: "pointer",
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
            fontFamily: '"Noto Sans Mono", monospace',
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== "settings") {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== "settings") {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.muted
            }
          }}
        >
          ⚙️ Settings
        </button>

        <button
          onClick={onLogout}
          style={{
            padding: "0.65rem 1rem",
            background: "transparent",
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            color: CSS_VARS.muted,
            cursor: "pointer",
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
            fontFamily: '"Noto Sans Mono", monospace',
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
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
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
