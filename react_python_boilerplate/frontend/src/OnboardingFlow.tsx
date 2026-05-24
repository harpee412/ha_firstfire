/**
 * FirstFire Onboarding Flow Component
 * Manages the multi-step onboarding process
 */

import { useState, useEffect } from "react"
import { Storage, initConfig, getConfigStatus } from "./api"
import { ConfigStatus, OnboardingStep } from "./types"
import WelcomeScreen from "./components/WelcomeScreen"
import TokenSetupScreen from "./components/TokenSetupScreen"
import ConfirmationScreen from "./components/ConfirmationScreen"
import ChatInterface from "./components/ChatInterface"

interface OnboardingFlowProps {
  onComplete?: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome")
  const [isLoading, setIsLoading] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if token is already configured (from HA or localStorage)
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await getConfigStatus()
        if (response.success && response.data?.configured) {
          // Token is already configured from Home Assistant or backend
          setStep("chat")
          return
        }
      } catch (err) {
        console.log("Could not check config status")
      }

      // Fallback: check localStorage
      const savedToken = Storage.getToken()
      if (savedToken) {
        setStep("chat")
      }
    }

    checkConfig()
  }, [])

  const handleWelcomeStart = () => {
    setStep("setup")
    setError(null)
  }

  const handleTokenSaved = async (token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Save token to localStorage
      Storage.saveToken(token)

      // Initialize backend config
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

      // Update config status
      if (response.data?.status) {
        setConfigStatus(response.data.status)
        Storage.saveConfig(response.data.status)
      }

      setStep("confirmation")
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      Storage.clearToken()
      setIsLoading(false)
    }
  }

  const handleConfirmationContinue = () => {
    setStep("chat")
    if (onComplete) {
      onComplete()
    }
  }

  const handleBackToSetup = () => {
    setStep("setup")
    Storage.clearToken()
    setError(null)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a 0%, #020617 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {step === "welcome" && (
        <WelcomeScreen onStart={handleWelcomeStart} />
      )}

      {step === "setup" && (
        <TokenSetupScreen
          onTokenSaved={handleTokenSaved}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === "confirmation" && (
        <ConfirmationScreen
          configStatus={configStatus}
          onContinue={handleConfirmationContinue}
          onBack={handleBackToSetup}
        />
      )}

      {step === "chat" && (
        <ChatInterface />
      )}
    </div>
  )
}
