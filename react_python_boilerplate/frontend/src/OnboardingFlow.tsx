/**
 * FirstFire Onboarding Flow Component
 * Cyberpunk smart-home onboarding shell
 */

import { useEffect, useState } from "react"

import {
  getConfigStatus,
  initConfig,
  Storage,
} from "./api"

import {
  ConfigStatus,
  OnboardingStep,
} from "./types"

import WelcomeScreen from "./components/WelcomeScreen"
import TokenSetupScreen from "./components/TokenSetupScreen"
import ConfirmationScreen from "./components/ConfirmationScreen"
import MainLayout from "./components/MainLayout"

interface OnboardingFlowProps {
  onComplete?: () => void
}

export default function OnboardingFlow({
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] =
    useState<OnboardingStep | "dashboard" | "chat">("welcome")

  const [isLoading, setIsLoading] =
    useState(false)

  const [configStatus, setConfigStatus] =
    useState<ConfigStatus | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  // Check if token already exists
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await getConfigStatus()

        if (
          response.success &&
          response.data?.configured
        ) {
          setStep("dashboard")
          return
        }
      } catch (err) {
        console.log(
          "Could not check config status"
        )
      }

      const savedToken = Storage.getToken()

      if (savedToken) {
        setStep("dashboard")
      }
    }

    checkConfig()
  }, [])

  const handleWelcomeStart = () => {
    setStep("setup")
    setError(null)
  }

  const handleTokenSaved = async (
    token: string
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      Storage.saveToken(token)

      const response = await initConfig(token)

      if (!response.success) {
        setError(
          response.error?.message ||
            "Failed to initialize configuration"
        )

        Storage.clearToken()
        setIsLoading(false)

        return
      }

      if (response.data?.status) {
        setConfigStatus(response.data.status)

        Storage.saveConfig(
          response.data.status
        )
      }

      setStep("confirmation")
      setIsLoading(false)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error"

      setError(message)

      Storage.clearToken()
      setIsLoading(false)
    }
  }

  const handleConfirmationContinue = () => {
    setStep("dashboard")

    if (onComplete) {
      onComplete()
    }
  }

  const handleBackToSetup = () => {
    setStep("setup")
    Storage.clearToken()
    setError(null)
  }

  const renderCurrentStep = () => {
    switch (step) {
      case "welcome":
        return (
          <WelcomeScreen
            onStart={handleWelcomeStart}
          />
        )

      case "setup":
        return (
          <TokenSetupScreen
            onTokenSaved={handleTokenSaved}
            isLoading={isLoading}
            error={error}
          />
        )

      case "confirmation":
        return (
          <ConfirmationScreen
            configStatus={configStatus}
            onContinue={
              handleConfirmationContinue
            }
            onBack={handleBackToSetup}
          />
        )

      case "dashboard":
      case "chat":
        return <MainLayout />

      default:
        return null
    }
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0c10",
        color: "#e8eaf6",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        position: "relative",
        fontFamily:
          '"Space Mono", monospace',
      }}
    >
      {/* Scanline Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)",
        }}
      />

      {/* App Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          padding: "1.5rem 2rem",
          borderBottom:
            "1px solid rgba(0,229,255,0.1)",
          background: "rgba(10,12,16,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #00e5ff 0%, #0077ff 100%)",
            boxShadow:
              "0 0 20px rgba(0,229,255,0.35)",
            flexShrink: 0,
            fontSize: "1.4rem",
          }}
        >
          🔥
        </div>

        {/* Header Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#00e5ff",
              fontFamily:
                '"Syne", sans-serif',
              textShadow:
                "0 0 20px rgba(0,229,255,0.4)",
            }}
          >
            FirstFire
          </h1>

          <p
            style={{
              margin: 0,
              marginTop: "0.15rem",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#5c6394",
            }}
          >
            AI Home Assistant System
          </p>
        </div>

        {/* Status Badge */}
        <div
          style={{
            marginLeft: "auto",
            padding: "0.35rem 0.8rem",
            borderRadius: "4px",
            border:
              "1px solid rgba(57,255,20,0.5)",
            background:
              "rgba(57,255,20,0.08)",
            color: "#39ff14",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          ● Online
        </div>
      </header>

      {/* Main Application Area */}
      <main
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 2,
        }}
      >
        {renderCurrentStep()}
      </main>
    </div>
  )
}