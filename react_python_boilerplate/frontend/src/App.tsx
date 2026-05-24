import { useEffect, useState } from "react";

type HelloResponse = {
  message: string;
};

export default function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await fetch("./api/hello");

        const data = (await response.json()) as HelloResponse;

        setMessage(data.message);
      } catch (error) {
        console.error(error);

        setMessage("Failed to connect to backend");
      }
    };

    void load();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a 0%, #020617 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: "24px",
          padding: "4rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "999px",
              background: "#22c55e",
              boxShadow: "0 0 14px #22c55e",
            }}
          />

          <span
            style={{
              color: "#94a3b8",
              fontSize: "0.95rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Home Assistant Add-on Boilerplate
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "4rem",
            lineHeight: 1,
            color: "white",
            fontWeight: 800,
          }}
        >
          React + Python
        </h1>

        <h2
          style={{
            marginTop: "0.75rem",
            marginBottom: "2rem",
            fontSize: "2.2rem",
            color: "#60a5fa",
            fontWeight: 600,
          }}
        >
          Modern Home Assistant Development Starter
        </h2>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "1.15rem",
            lineHeight: 1.8,
            maxWidth: "700px",
          }}
        >
          A production-ready foundation for building Home Assistant add-ons
          using React, TypeScript, FastAPI, Docker, and Home Assistant
          Ingress.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginTop: "3rem",
          }}
        >
          {[
            "React",
            "TypeScript",
            "Vite",
            "FastAPI",
            "Docker",
            "Ingress Ready",
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                borderRadius: "16px",
                padding: "1.25rem",
                color: "#e2e8f0",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "3rem",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "18px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Backend Status
          </div>

          <div
            style={{
              color: "#4ade80",
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}