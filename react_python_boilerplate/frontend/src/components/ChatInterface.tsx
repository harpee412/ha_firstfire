/**
 * FirstFire Chat Interface Component
 * Valheim-inspired design
 */

import { useState, useRef, useEffect } from "react"
import { sendChat, Storage } from "../api"
import { Message } from "../types"

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    setError(null)
    const userMessage = input.trim()
    setInput("")

    // Add user message to display
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
        background: "linear-gradient(135deg, #2d1810 0%, #1a0f0a 50%, #0f0606 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 90, 43, 0.03) 2px, rgba(139, 90, 43, 0.03) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 90, 43, 0.03) 2px, rgba(139, 90, 43, 0.03) 4px)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "3px solid #8b5a2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(61, 34, 20, 0.95) 0%, rgba(45, 24, 16, 0.95) 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(139, 90, 43, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
            }}
          >
            <div style={{ fontSize: "2.5rem" }}>⚔️</div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.8rem",
                  color: "#d4af37",
                  fontWeight: 800,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                FirstFire
              </h2>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.9rem",
                  color: "#c19a6b",
                }}
              >
                🏰 Your Viking Guide to Home Automation
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            style={{
              width: "45px",
              height: "45px",
              padding: 0,
              background: "rgba(139, 90, 43, 0.4)",
              border: "2px solid #8b5a2b",
              borderRadius: "4px",
              color: "#d4af37",
              cursor: "pointer",
              fontSize: "1.4rem",
              transition: "all 0.2s",
              fontWeight: 700,
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(139, 90, 43, 0.6)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(139, 90, 43, 0.4)"
            }}
          >
            🛡️
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, rgba(61, 34, 20, 0.8) 0%, rgba(45, 24, 16, 0.8) 100%)",
              borderBottom: "2px solid #8b5a2b",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <button
              onClick={handleClearChat}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(139, 90, 43, 0.3)",
                color: "#c19a6b",
                border: "1px solid #8b5a2b",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(139, 90, 43, 0.5)"
                ;(e.target as HTMLButtonElement).style.color = "#d4af37"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(139, 90, 43, 0.3)"
                ;(e.target as HTMLButtonElement).style.color = "#c19a6b"
              }}
            >
              🗑️ Clear Scrolls
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(127, 29, 29, 0.2)",
                color: "#f87171",
                border: "1px solid rgba(220, 38, 38, 0.5)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(127, 29, 29, 0.4)"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.background =
                  "rgba(127, 29, 29, 0.2)"
              }}
            >
              🚪 Depart
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
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
                color: "#94a3b8",
              }}
            >
              <div>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                  📜
                </div>
                <p style={{ color: "#d4af37", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Greetings, Wanderer
                </p>
                <p style={{ color: "#c19a6b" }}>Ask me anything about Home Assistant!</p>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#64748b" }}>
                  Setup help, configuration tips, integration guides...
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
                  maxWidth: "70%",
                  padding: "1rem 1.5rem",
                  borderRadius: "8px",
                  background:
                    msg.role === "user"
                      ? "rgba(139, 90, 43, 0.3)"
                      : "rgba(139, 90, 43, 0.15)",
                  border: `1px solid ${
                    msg.role === "user"
                      ? "rgba(212, 175, 55, 0.3)"
                      : "rgba(139, 90, 43, 0.4)"
                  }`,
                  color:
                    msg.role === "user"
                      ? "#d4af37"
                      : "#e2e8f0",
                  lineHeight: 1.6,
                }}
              >
                {msg.content}
                {msg.tokens_used && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#c19a6b",
                      marginTop: "0.5rem",
                    }}
                  >
                    ⚡ {msg.tokens_used} runes
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
                  padding: "1rem 1.5rem",
                  borderRadius: "8px",
                  background: "rgba(139, 90, 43, 0.15)",
                  border: "1px solid rgba(139, 90, 43, 0.4)",
                  color: "#c19a6b",
                  fontStyle: "italic",
                }}
              >
                ✨ Consulting the oracle...
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(127, 29, 29, 0.2)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "0.9rem",
              }}
            >
              ⚔️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "2px solid #8b5a2b",
            background: "rgba(20, 15, 10, 0.7)",
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
                placeholder="Ask the oracle of Home Assistant..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  background: "rgba(20, 15, 10, 0.8)",
                  border: "1px solid #8b5a2b",
                  borderRadius: "4px",
                  color: "#d4af37",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  opacity: isLoading ? 0.5 : 1,
                }}
                onFocus={(e) => {
                  ;(e.target as HTMLInputElement).style.borderColor = "#d4af37"
                  ;(e.target as HTMLInputElement).style.boxShadow =
                    "0 0 10px rgba(212, 175, 55, 0.2)"
                }}
                onBlur={(e) => {
                  ;(e.target as HTMLInputElement).style.borderColor = "#8b5a2b"
                  ;(e.target as HTMLInputElement).style.boxShadow = "none"
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background:
                    !input.trim() || isLoading
                      ? "rgba(139, 90, 43, 0.3)"
                      : "linear-gradient(135deg, #c84a1a 0%, #8b3a0a 100%)",
                  color:
                    !input.trim() || isLoading
                      ? "#8b5a2b"
                      : "#d4af37",
                  border: `2px solid ${
                    !input.trim() || isLoading
                      ? "rgba(139, 90, 43, 0.3)"
                      : "#d4af37"
                  }`,
                  borderRadius: "4px",
                  cursor:
                    !input.trim() || isLoading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  textShadow: !input.trim() || isLoading ? "none" : "1px 1px 2px rgba(0,0,0,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (!(!input.trim() || isLoading)) {
                    ;(e.target as HTMLButtonElement).style.transform =
                      "translateY(-2px)"
                    ;(e.target as HTMLButtonElement).style.boxShadow =
                      "0 8px 16px rgba(200, 74, 26, 0.4)"
                  }
                }}
                onMouseLeave={(e) => {
                  ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
                  ;(e.target as HTMLButtonElement).style.boxShadow = "none"
                }}
              >
                ⚔️ Consult
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
