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
        width: "100%",
        maxWidth: "900px",
        height: "100vh",
        maxHeight: "100vh",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 15, 30, 0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "1.5rem" }}>🔥</div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                color: "white",
                fontWeight: 700,
              }}
            >
              FirstFire
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.85rem",
                color: "#60a5fa",
              }}
            >
              Your AI Home Assistant Guide
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            style={{
              width: "40px",
              height: "40px",
              padding: 0,
              background: "rgba(148, 163, 184, 0.1)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "1.2rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(148, 163, 184, 0.2)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLButtonElement).style.background =
                "rgba(148, 163, 184, 0.1)"
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(30, 41, 59, 0.8)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleClearChat}
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(148, 163, 184, 0.1)",
              color: "#cbd5e1",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s",
            }}
          >
            🗑️ Clear Chat
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s",
            }}
          >
            🚪 Logout
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
              color: "#64748b",
            }}
          >
            <div>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                🤖
              </div>
              <p>Ask me anything about Home Assistant!</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
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
                borderRadius: "12px",
                background:
                  msg.role === "user"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(148, 163, 184, 0.1)",
                border: `1px solid ${
                  msg.role === "user"
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(148, 163, 184, 0.2)"
                }`,
                color: "#e2e8f0",
                lineHeight: 1.6,
              }}
            >
              {msg.content}
              {msg.tokens_used && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginTop: "0.5rem",
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
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                background: "rgba(148, 163, 184, 0.1)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#94a3b8",
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "1.5rem",
          borderTop: "1px solid rgba(148, 163, 184, 0.1)",
          background: "rgba(10, 15, 30, 0.5)",
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
              placeholder="Ask me about Home Assistant..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "1rem",
                transition: "all 0.2s",
                opacity: isLoading ? 0.6 : 1,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                padding: "0.75rem 1.5rem",
                background:
                  !input.trim() || isLoading
                    ? "rgba(59, 130, 246, 0.3)"
                    : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor:
                  !input.trim() || isLoading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
