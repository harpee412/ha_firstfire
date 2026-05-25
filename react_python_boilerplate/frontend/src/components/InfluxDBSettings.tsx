/**
 * InfluxDB Settings Component
 * Configure InfluxDB connection for analytics
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

interface InfluxDBStatus {
  configured: boolean
  url?: string
  org?: string
  bucket?: string
  connected: boolean
}

export default function InfluxDBSettings() {
  const [status, setStatus] = useState<InfluxDBStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isV1, setIsV1] = useState(false)
  const [formData, setFormData] = useState({
    url: "",
    token: "",
    username: "",
    org: "home-assistant",
    bucket: "home_assistant",
    use_v1: false,
  })

  // Fetch InfluxDB status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/influxdb/status")
      const data = await response.json()

      if (data.success && data.data) {
        setStatus(data.data)
        setFormData({
          url: data.data.url || "",
          token: "",
          org: data.data.org || "home-assistant",
          bucket: data.data.bucket || "home_assistant",
        })
      }
    } catch (err) {
      console.error("Failed to fetch InfluxDB status:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.url || !formData.token) {
      setError("URL and token are required")
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/influxdb/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("InfluxDB connected successfully!")
        setShowForm(false)
        fetchStatus()
      } else {
        setError(data.error?.message || "Failed to configure InfluxDB")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Configuration failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      const response = await fetch("/api/influxdb/test")
      const data = await response.json()

      if (data.success) {
        setSuccess("InfluxDB connection successful!")
      } else {
        setError(data.error?.message || "Connection test failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed")
    }
  }

  return (
    <div
      style={{
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: CSS_VARS.surface,
          border: `1px solid ${CSS_VARS.border}`,
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "1.5rem" }}>📊</div>
          <div>
            <h2 style={{ margin: 0, color: CSS_VARS.accent, fontSize: "1.1rem" }}>
              InfluxDB Analytics
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.85rem",
                color: CSS_VARS.muted,
              }}
            >
              Time-series database for historical data analysis
            </p>
          </div>
        </div>

        {/* Status */}
        {isLoading ? (
          <p style={{ color: CSS_VARS.muted, margin: 0 }}>Loading status...</p>
        ) : status ? (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: CSS_VARS.surface2,
              borderRadius: "6px",
              border: `1px solid ${CSS_VARS.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: status.connected
                    ? CSS_VARS.accent3
                    : CSS_VARS.accent2,
                }}
              />
              <span style={{ fontWeight: 600 }}>
                {status.connected ? "Connected" : status.configured ? "Configured" : "Not Connected"}
              </span>
            </div>

            {status.configured && (
              <div style={{ fontSize: "0.85rem", color: CSS_VARS.muted }}>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong>URL:</strong> {status.url}
                </p>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong>Org:</strong> {status.org}
                </p>
                <p style={{ margin: "0.25rem 0" }}>
                  <strong>Bucket:</strong> {status.bucket}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Messages */}
        {error && (
          <div
            style={{
              padding: "0.75rem",
              background: "rgba(255,61,113,0.1)",
              border: `1px solid ${CSS_VARS.accent2}`,
              borderRadius: "6px",
              color: CSS_VARS.accent2,
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "0.75rem",
              background: "rgba(57,255,20,0.1)",
              border: `1px solid ${CSS_VARS.accent3}`,
              borderRadius: "6px",
              color: CSS_VARS.accent3,
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Form */}
        {showForm ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: CSS_VARS.accent,
                    marginBottom: "0.4rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  InfluxDB URL
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="http://influxdb:8086"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: CSS_VARS.surface2,
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: "6px",
                    color: CSS_VARS.text,
                    fontSize: "0.85rem",
                    fontFamily: '"Noto Sans Mono", monospace',
                    boxSizing: "border-box",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: CSS_VARS.muted,
                    margin: "0.3rem 0 0 0",
                  }}
                >
                  Default: http://influxdb:8086 (if running as HA addon)
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: CSS_VARS.accent,
                    marginBottom: "0.4rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  API Token
                </label>
                <input
                  type="password"
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  placeholder="Your InfluxDB API token"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: CSS_VARS.surface2,
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: "6px",
                    color: CSS_VARS.text,
                    fontSize: "0.85rem",
                    fontFamily: '"Noto Sans Mono", monospace',
                    boxSizing: "border-box",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: CSS_VARS.muted,
                    margin: "0.3rem 0 0 0",
                  }}
                >
                  Find in InfluxDB: Data → Tokens
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: CSS_VARS.accent,
                      marginBottom: "0.4rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Organization
                  </label>
                  <input
                    type="text"
                    name="org"
                    value={formData.org}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: CSS_VARS.surface2,
                      border: `1px solid ${CSS_VARS.border}`,
                      borderRadius: "6px",
                      color: CSS_VARS.text,
                      fontSize: "0.85rem",
                      fontFamily: '"Noto Sans Mono", monospace',
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: CSS_VARS.accent,
                      marginBottom: "0.4rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Bucket
                  </label>
                  <input
                    type="text"
                    name="bucket"
                    value={formData.bucket}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: CSS_VARS.surface2,
                      border: `1px solid ${CSS_VARS.border}`,
                      borderRadius: "6px",
                      color: CSS_VARS.text,
                      fontSize: "0.85rem",
                      fontFamily: '"Noto Sans Mono", monospace',
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: CSS_VARS.accent,
                    color: "#000",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: '"Noto Sans Mono", monospace',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? "Saving..." : "Save & Connect"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "transparent",
                    color: CSS_VARS.muted,
                    border: `1px solid ${CSS_VARS.border}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: '"Noto Sans Mono", monospace',
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent
                    ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
                    ;(e.target as HTMLButtonElement).style.color = CSS_VARS.muted
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {status?.configured && status?.connected && (
              <button
                onClick={handleTestConnection}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "transparent",
                  color: CSS_VARS.accent3,
                  border: `1px solid ${CSS_VARS.accent3}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: '"Noto Sans Mono", monospace',
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  ;(e.target as HTMLButtonElement).style.background =
                    "rgba(57,255,20,0.1)"
                }}
                onMouseLeave={(e) => {
                  ;(e.target as HTMLButtonElement).style.background =
                    "transparent"
                }}
              >
                Test Connection
              </button>
            )}

            <button
              onClick={() => setShowForm(true)}
              style={{
                flex: 1,
                padding: "0.75rem",
                background: status?.connected ? "transparent" : CSS_VARS.accent,
                color: status?.connected ? CSS_VARS.accent : "#000",
                border: status?.connected ? `1px solid ${CSS_VARS.accent}` : "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: '"Noto Sans Mono", monospace',
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!status?.connected) return
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(0,229,255,0.1)"
              }}
              onMouseLeave={(e) => {
                if (!status?.connected) return
                ;(e.target as HTMLButtonElement).style.background = "transparent"
              }}
            >
              {status?.configured ? "Update" : "Configure"} InfluxDB
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
