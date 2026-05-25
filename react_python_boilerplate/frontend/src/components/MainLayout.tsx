/**
 * FirstFire Main Layout Component
 * Wraps sidebar with main content area
 */

import { useState } from "react"
import Sidebar from "./Sidebar"
import Dashboard from "./Dashboard"
import ChatInterface from "./ChatInterface"
import { Storage } from "../api"

const CSS_VARS = {
  bg: "#0a0c10",
  text: "#e8eaf6",
}

export default function MainLayout() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "chat">(
    "dashboard"
  )

  const handleLogout = () => {
    if (confirm("Remove your API token and return to setup?")) {
      Storage.clear()
      window.location.reload()
    }
  }

  const handleSettings = () => {
    // Navigate to chat settings would go here
    setCurrentPage("chat")
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        background: CSS_VARS.bg,
        color: CSS_VARS.text,
        fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Scanline Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,229,255,0.015) 2px,
            rgba(0,229,255,0.015) 4px
          )`,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
        }}
      >
        {currentPage === "dashboard" ? (
          <Dashboard onNavigateToChat={() => setCurrentPage("chat")} />
        ) : (
          <ChatInterface
            onBackToDashboard={() => setCurrentPage("dashboard")}
          />
        )}
      </div>
    </div>
  )
}
