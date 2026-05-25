/**
 * Analytics Page - View historical data and trends from InfluxDB
 */

import { useState, useEffect } from "react"
import {
  getAnalyticsEntities,
  getEntityHistory,
  getEntityStats,
  getEntityPatterns,
} from "../api"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

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

interface AnalyticsData {
  history: any
  stats: any
  patterns: any
}

export default function AnalyticsPage() {
  const [entities, setEntities] = useState<string[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string>("")
  const [timeRange, setTimeRange] = useState<number>(24) // hours
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)

  // Load available entities on mount
  useEffect(() => {
    loadEntities()
  }, [])

  // Load analytics data when entity or time range changes
  useEffect(() => {
    if (selectedEntity) {
      loadAnalyticsData()
    }
  }, [selectedEntity, timeRange])

  const loadEntities = async () => {
    try {
      const response = await getAnalyticsEntities()
      if (response.success && response.data?.entities) {
        setEntities(response.data.entities)
        setSelectedEntity(response.data.entities[0])
      }
    } catch (err) {
      setError("Failed to load entities")
    }
  }

  const loadAnalyticsData = async () => {
    if (!selectedEntity) return

    setLoading(true)
    setError(null)

    try {
      const [historyRes, statsRes, patternsRes] = await Promise.all([
        getEntityHistory(selectedEntity, timeRange),
        getEntityStats(selectedEntity, timeRange),
        getEntityPatterns(selectedEntity, Math.max(timeRange, 168)),
      ])

      setData({
        history: historyRes.data,
        stats: statsRes.data,
        patterns: patternsRes.data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", color: CSS_VARS.accent, fontSize: "1.8rem" }}>
          📊 Analytics
        </h1>
        <p style={{ margin: 0, color: CSS_VARS.muted, fontSize: "0.9rem" }}>
          Historical data and insights from InfluxDB
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          background: CSS_VARS.surface,
          padding: "1.5rem",
          borderRadius: "8px",
          border: `1px solid ${CSS_VARS.border}`,
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              color: CSS_VARS.accent,
              marginBottom: "0.4rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Entity
          </label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: CSS_VARS.surface2,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "6px",
              color: CSS_VARS.text,
              fontSize: "0.85rem",
            }}
          >
            {entities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "150px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              color: CSS_VARS.accent,
              marginBottom: "0.4rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: CSS_VARS.surface2,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "6px",
              color: CSS_VARS.text,
              fontSize: "0.85rem",
            }}
          >
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last 7 Days</option>
            <option value={720}>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Error */}
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

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: CSS_VARS.muted }}>
          Loading analytics data...
        </div>
      )}

      {/* Statistics Cards */}
      {data?.stats && !loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {data.stats.stats && (
            <>
              {data.stats.stats.mean !== undefined && (
                <StatCard label="Average" value={data.stats.stats.mean} />
              )}
              {data.stats.stats.max !== undefined && (
                <StatCard label="Max" value={data.stats.stats.max} />
              )}
              {data.stats.stats.min !== undefined && (
                <StatCard label="Min" value={data.stats.stats.min} />
              )}
              {data.stats.stats.count !== undefined && (
                <StatCard label="Data Points" value={data.stats.stats.count} unit="" />
              )}
            </>
          )}
        </div>
      )}

      {/* History Chart */}
      {data?.history?.data && !loading && (
        <div
          style={{
            background: CSS_VARS.surface,
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: CSS_VARS.accent }}
          >
            Historical Data
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.history.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={CSS_VARS.border} />
              <XAxis
                dataKey="timestamp"
                stroke={CSS_VARS.muted}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={CSS_VARS.muted} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: CSS_VARS.surface2,
                  border: `1px solid ${CSS_VARS.border}`,
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CSS_VARS.accent}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Usage Patterns */}
      {data?.patterns && !loading && (
        <div
          style={{
            background: CSS_VARS.surface,
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: CSS_VARS.accent }}
          >
            Usage Patterns
          </h2>
          {data.patterns.state_changes !== undefined && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <StatCard
                label="State Changes"
                value={data.patterns.state_changes}
                unit=""
              />
              <div
                style={{
                  background: CSS_VARS.surface2,
                  border: `1px solid ${CSS_VARS.border}`,
                  borderRadius: "6px",
                  padding: "1rem",
                }}
              >
                <p style={{ margin: "0 0 0.5rem 0", color: CSS_VARS.muted, fontSize: "0.75rem" }}>
                  ANALYSIS PERIOD
                </p>
                <p style={{ margin: 0, fontSize: "1.2rem", color: CSS_VARS.accent3 }}>
                  {data.patterns.analysis_hours}h
                </p>
              </div>
            </div>
          )}
          {data.patterns.recent_changes && data.patterns.recent_changes.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: CSS_VARS.text }}>
                Recent Changes
              </h3>
              <div style={{ fontSize: "0.8rem", color: CSS_VARS.muted }}>
                {data.patterns.recent_changes.slice(0, 5).map((change: any, idx: number) => (
                  <div key={idx} style={{ padding: "0.5rem 0" }}>
                    {change.from} → {change.to} at {new Date(change.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {!loading && !data && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: CSS_VARS.muted,
          }}
        >
          Select an entity to view analytics data
        </div>
      )}
    </div>
  )
}

/**
 * Statistics Card Component
 */
function StatCard({
  label,
  value,
  unit = "",
}: {
  label: string
  value: number | string
  unit?: string
}) {
  return (
    <div
      style={{
        background: CSS_VARS.surface2,
        border: `1px solid ${CSS_VARS.border}`,
        borderRadius: "6px",
        padding: "1rem",
      }}
    >
      <p
        style={{
          margin: "0 0 0.5rem 0",
          fontSize: "0.75rem",
          color: CSS_VARS.muted,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1.5rem", color: CSS_VARS.accent3 }}>
        {typeof value === "number" ? value.toFixed(2) : value}
        <span style={{ fontSize: "0.8rem", marginLeft: "0.25rem" }}>{unit}</span>
      </p>
    </div>
  )
}
