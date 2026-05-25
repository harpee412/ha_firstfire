/**
 * FirstFire Home Assistant App
 * AI-Powered Home Assistant Onboarding and Setup Guide
 */

import { useState } from "react"
import OnboardingFlow from "./OnboardingFlow"
import AnalyticsPage from "./components/AnalyticsPage"
import faviconSvg from "../public/favicon.svg"

const CSS_VARS = {
  bg: "#0a0c10",
  surface: "#111420",
  border: "#1e2540",
  accent: "#00e5ff",
  text: "#e8eaf6",
  muted: "#5c6394",
}

type PageType = "dashboard" | "analytics"

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  return (
    <div style={{ background: CSS_VARS.bg, minHeight: "100vh" }}>
      {/* Navigation Bar */}
      <nav
        style={{
          background: CSS_VARS.surface,
          borderBottom: `1px solid ${CSS_VARS.border}`,
          padding: "1rem 2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setCurrentPage("dashboard")}
          style={{
            padding: "0.5rem 1rem",
            background: currentPage === "dashboard" ? CSS_VARS.accent : "transparent",
            color: currentPage === "dashboard" ? "#000" : CSS_VARS.text,
            border: currentPage === "dashboard" ? "none" : `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img src={faviconSvg} alt="FirstFire" style={{ width: "20px", height: "20px" }} />
          Dashboard
        </button>

        <button
          onClick={() => setCurrentPage("analytics")}
          style={{
            padding: "0.5rem 1rem",
            background: currentPage === "analytics" ? CSS_VARS.accent : "transparent",
            color: currentPage === "analytics" ? "#000" : CSS_VARS.text,
            border: currentPage === "analytics" ? "none" : `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
            transition: "all 0.2s",
          }}
        >
          📊 Analytics
        </button>
      </nav>

      {/* Page Content */}
      <main style={{ background: CSS_VARS.bg }}>
        {currentPage === "dashboard" && <OnboardingFlow />}
        {currentPage === "analytics" && <AnalyticsPage />}
      </main>
    </div>
  )
}
