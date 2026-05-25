/**
 * FirstFire Chat Interface Component
 * Cyberpunk/Sci-Fi Design with Markdown rendering
 */

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { sendChat, Storage } from "../api"
import { Message } from "../types"

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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    setError(null)
    const userMessage = input.trim()
    setInput("")

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await sendChat(userMessage)

      if (response.success && response.data) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.response,
          timestamp: Date.now(),
          tokens_used: response.data.tokens_used,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } else {
        setError(
          response.error?.message || "Failed to get response from AI"
        )
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (confirm("Clear all messages? This cannot be undone.")) {
      setMessages([])
    }
  }

  const handleLogout = () => {
    if (confirm("Remove your API token and return to setup?")) {
      Storage.clear()
      window.location.reload()
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: CSS_VARS.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Space Mono', monospace",
        color: CSS_VARS.text,
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,229,255,0.015) 2px,
            rgba(0,229,255,0.015) 4px
          )`,
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: "2rem 2rem 1rem",
          borderBottom: `1px solid ${CSS_VARS.border}`,
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          position: "sticky",
          top: 0,
          background: "rgba(10,12,16,0.95)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            background: "linear-gradient(135deg, #00e5ff, #0077ff)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: "0 0 20px rgba(0,229,255,0.25)",
            flexShrink: 0,
          }}
        >
          🔥
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: CSS_VARS.accent,
              textShadow: "0 0 20px rgba(0,229,255,0.25)",
              margin: 0,
            }}
          >
            FirstFire
          </h1>
          <p
            style={{
              fontSize: "0.65rem",
              color: CSS_VARS.muted,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: "2px",
              margin: "2px 0 0 0",
            }}
          >
            Build your first fire
          </p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
          style={{
            marginLeft: "auto",
            width: "45px",
            height: "45px",
            padding: 0,
            background: "transparent",
            border: `1px solid ${CSS_VARS.border}`,
            borderRadius: "6px",
            color: CSS_VARS.accent,
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.2s",
            fontWeight: 700,
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent
            ;(e.target as HTMLButtonElement).style.boxShadow =
              "0 0 15px rgba(0,229,255,0.3)"
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
            ;(e.target as HTMLButtonElement).style.boxShadow = "none"
          }}
        >
          ⚙
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            padding: "1.5rem",
            background: CSS_VARS.surface,
            borderBottom: `1px solid ${CSS_VARS.border}`,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleClearChat}
            style={{
              padding: "0.65rem 1.25rem",
              background: "transparent",
              color: CSS_VARS.muted,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "all 0.2s",
              fontFamily: "'Space Mono', monospace",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent2
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent2
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 0 15px rgba(255,61,113,0.2)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.muted
              ;(e.target as HTMLButtonElement).style.boxShadow = "none"
            }}
          >
            Clear Chat
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.65rem 1.25rem",
              background: "transparent",
              color: CSS_VARS.muted,
              border: `1px solid ${CSS_VARS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "all 0.2s",
              fontFamily: "'Space Mono', monospace",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.accent2
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.accent2
              ;(e.target as HTMLButtonElement).style.boxShadow =
                "0 0 15px rgba(255,61,113,0.2)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.borderColor = CSS_VARS.border
              ;(e.target as HTMLButtonElement).style.color = CSS_VARS.muted
              ;(e.target as HTMLButtonElement).style.boxShadow = "none"
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: CSS_VARS.muted,
            }}
          >
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                ▶
              </div>
              <p
                style={{
                  color: CSS_VARS.accent,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  textShadow: "0 0 10px rgba(0,229,255,0.3)",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Ready to automate
              </p>
              <p style={{ color: CSS_VARS.muted, fontSize: "0.9rem", margin: 0 }}>
                Ask anything about Home Assistant
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                background:
                  msg.role === "user"
                    ? CSS_VARS.surface2
                    : CSS_VARS.surface,
                border: `1px solid ${
                  msg.role === "user"
                    ? "rgba(0,229,255,0.2)"
                    : CSS_VARS.border
                }`,
                color: msg.role === "user" ? CSS_VARS.accent : CSS_VARS.text,
                lineHeight: 1.6,
                fontSize: "0.85rem",
                maxWidth: "100%",
                boxShadow:
                  msg.role === "user"
                    ? "0 0 15px rgba(0,229,255,0.1)"
                    : "none",
              }}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 style={{ fontSize: "1.3rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: CSS_VARS.accent }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: "1.1rem", marginTop: "0.4rem", marginBottom: "0.4rem", color: CSS_VARS.accent }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: "1rem", marginTop: "0.3rem", marginBottom: "0.3rem", color: CSS_VARS.accent }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: "0.5rem", marginTop: 0 }}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ marginLeft: "1.5rem", marginTop: "0.3rem", marginBottom: "0.5rem" }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ marginLeft: "1.5rem", marginTop: "0.3rem", marginBottom: "0.5rem" }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginBottom: "0.2rem" }}>
                        {children}
                      </li>
                    ),
                    code: ({ children }) => (
                      <code style={{ background: CSS_VARS.surface2, padding: "0.2rem 0.4rem", borderRadius: "3px", color: CSS_VARS.accent3, fontFamily: "'Space Mono', monospace", fontSize: "0.8rem" }}>
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre style={{ background: CSS_VARS.surface2, padding: "0.75rem", borderRadius: "4px", overflow: "auto", marginTop: "0.3rem", marginBottom: "0.5rem", border: `1px solid ${CSS_VARS.border}` }}>
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote style={{ borderLeft: `3px solid ${CSS_VARS.accent}`, paddingLeft: "0.75rem", marginLeft: 0, marginTop: "0.3rem", marginBottom: "0.5rem", opacity: 0.8 }}>
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ color: CSS_VARS.accent, fontWeight: 700 }}>
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
              {msg.tokens_used && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: CSS_VARS.muted,
                    marginTop: "0.5rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {msg.tokens_used} tokens
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                background: CSS_VARS.surface2,
                border: `1px solid ${CSS_VARS.border}`,
                color: CSS_VARS.muted,
                fontSize: "0.85rem",
              }}
            >
              ▌ Processing...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(255,61,113,0.08)",
              border: `1px solid rgba(255,61,113,0.3)`,
              borderRadius: "8px",
              color: CSS_VARS.accent2,
              fontSize: "0.85rem",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderTop: `1px solid ${CSS_VARS.border}`,
          background: CSS_VARS.bg,
        }}
      >
        <form onSubmit={handleSendMessage}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-end",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start your first fire..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: CSS_VARS.surface,
                border: `1px solid ${CSS_VARS.border}`,
                borderRadius: "6px",
                color: CSS_VARS.text,
                fontSize: "0.85rem",
                transition: "all 0.2s",
                opacity: isLoading ? 0.5 : 1,
                fontFamily: "'Space Mono', monospace",
              }}
              onFocus={(e) => {
                ;(e.target as HTMLInputElement).style.borderColor = CSS_VARS.accent
                ;(e.target as HTMLInputElement).style.boxShadow =
                  "0 0 15px rgba(0,229,255,0.2)"
              }}
              onBlur={(e) => {
                ;(e.target as HTMLInputElement).style.borderColor = CSS_VARS.border
                ;(e.target as HTMLInputElement).style.boxShadow = "none"
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                padding: "0.65rem 1.25rem",
                background:
                  !input.trim() || isLoading
                    ? "transparent"
                    : CSS_VARS.accent,
                color:
                  !input.trim() || isLoading
                    ? CSS_VARS.muted
                    : "#000",
                border: `1px solid ${
                  !input.trim() || isLoading
                    ? CSS_VARS.border
                    : CSS_VARS.accent
                }`,
                borderRadius: "6px",
                cursor:
                  !input.trim() || isLoading ? "not-allowed" : "pointer",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                transition: "all 0.2s",
                boxShadow:
                  !input.trim() || isLoading
                    ? "none"
                    : "0 0 15px rgba(0,229,255,0.3)",
                fontFamily: "'Space Mono', monospace",
              }}
              onMouseEnter={(e) => {
                if (!(!input.trim() || isLoading)) {
                  ;(e.target as HTMLButtonElement).style.boxShadow =
                    "0 0 25px rgba(0,229,255,0.5)"
                  ;(e.target as HTMLButtonElement).style.transform =
                    "translateY(-1px)"
                }
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.boxShadow =
                  "0 0 15px rgba(0,229,255,0.3)"
                ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
