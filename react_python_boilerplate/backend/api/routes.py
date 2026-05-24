"""
FirstFire API Routes

Handles configuration, validation, and OpenAI chat endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from config import get_config_manager, get_config, ConfigManager
import openai

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class ChatRequest(BaseModel):
    """Chat message request"""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat message response"""
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None


class ConfigInitRequest(BaseModel):
    """Configuration initialization request"""
    openai_token: str = Field(..., min_length=20)
    model: Optional[str] = "gpt-4-turbo"
    max_tokens: Optional[int] = 500


class ConfigStatusResponse(BaseModel):
    """Configuration status response"""
    configured: bool
    model: str
    max_tokens: int
    openai_token_masked: Optional[str]


class ValidationResponse(BaseModel):
    """Token validation response"""
    success: bool
    valid: bool
    error: Optional[str] = None


class ModelInfo(BaseModel):
    """Available OpenAI model information"""
    id: str
    name: str


# ============================================================================
# Legacy Routes (maintained for compatibility)
# ============================================================================

@router.get("/status")
async def status() -> dict[str, str]:
    """Legacy status endpoint"""
    return {
        "status": "online"
    }


@router.get("/hello")
async def hello() -> dict[str, str]:
    """Legacy hello endpoint"""
    return {
        "message": "Hello from API routes!"
    }


# ============================================================================
# Configuration Routes
# ============================================================================

@router.post("/config/init", response_model=ChatResponse)
async def init_config(request: ConfigInitRequest) -> ChatResponse:
    """Initialize/update OpenAI configuration"""
    try:
        config_manager = get_config_manager()
        success, error = config_manager.update_token(request.openai_token)

        if not success:
            return ChatResponse(
                success=False,
                error={"code": "INVALID_TOKEN", "message": error}
            )

        # Update other config values if provided
        if request.model:
            config_manager.get_config().model = request.model
        if request.max_tokens:
            config_manager.get_config().max_tokens = request.max_tokens

        return ChatResponse(
            success=True,
            data={
                "message": "Configuration saved successfully",
                "status": config_manager.get_status()
            }
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "CONFIG_ERROR",
                "message": f"Failed to save configuration: {str(e)}"
            }
        )


@router.get("/config/status", response_model=ChatResponse)
async def get_config_status() -> ChatResponse:
    """Get current configuration status"""
    try:
        config_manager = get_config_manager()
        return ChatResponse(
            success=True,
            data=config_manager.get_status()
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "CONFIG_ERROR",
                "message": str(e)
            }
        )


@router.post("/validate-token", response_model=ValidationResponse)
async def validate_token(request: ConfigInitRequest) -> ValidationResponse:
    """Validate OpenAI token without storing it"""
    try:
        from config import FirstFireConfig

        # Validate format
        config = FirstFireConfig(openai_token=request.openai_token)

        # Try a simple API call to verify token is valid
        try:
            openai.api_key = config.openai_token
            # Make a simple list models call - minimal API usage
            models = openai.models.list()
            return ValidationResponse(
                success=True,
                valid=True
            )
        except openai.AuthenticationError:
            return ValidationResponse(
                success=True,
                valid=False,
                error="Invalid API key - authentication failed"
            )
        except Exception as e:
            # Token format is valid but API call failed (network, rate limit, etc)
            return ValidationResponse(
                success=True,
                valid=False,
                error=f"API validation failed: {str(e)}"
            )

    except ValueError as e:
        return ValidationResponse(
            success=False,
            valid=False,
            error=f"Invalid token format: {str(e)}"
        )


@router.get("/models", response_model=ChatResponse)
async def get_available_models() -> ChatResponse:
    """Get list of available OpenAI models"""
    try:
        models = [
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo (Recommended)"},
            {"id": "gpt-4", "name": "GPT-4"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo (Fast)"},
        ]
        return ChatResponse(
            success=True,
            data={"models": models}
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "ERROR",
                "message": str(e)
            }
        )


# ============================================================================
# Chat Routes
# ============================================================================

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Send a message to OpenAI and get a response"""
    try:
        config = get_config()

        # Check if OpenAI token is configured
        if not config.is_configured():
            return ChatResponse(
                success=False,
                error={
                    "code": "NOT_CONFIGURED",
                    "message": "OpenAI API token not configured. Please configure it in the app settings."
                }
            )

        # Set OpenAI API key
        openai.api_key = config.openai_token

        # Create chat completion
        try:
            response = openai.chat.completions.create(
                model=config.model,
                messages=[
                    {
                        "role": "system",
                        "content": config.system_prompt
                    },
                    {
                        "role": "user",
                        "content": request.message
                    }
                ],
                max_tokens=config.max_tokens,
                temperature=0.7,
            )

            message_content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0

            return ChatResponse(
                success=True,
                data={
                    "response": message_content,
                    "tokens_used": tokens_used,
                    "model": config.model,
                }
            )

        except openai.RateLimitError:
            return ChatResponse(
                success=False,
                error={
                    "code": "RATE_LIMIT",
                    "message": "Rate limited by OpenAI API. Please wait a moment and try again."
                }
            )
        except openai.AuthenticationError:
            return ChatResponse(
                success=False,
                error={
                    "code": "AUTH_ERROR",
                    "message": "OpenAI API token is invalid. Please check your token in settings."
                }
            )
        except openai.APIConnectionError:
            return ChatResponse(
                success=False,
                error={
                    "code": "CONNECTION_ERROR",
                    "message": "Failed to connect to OpenAI API. Please check your internet connection."
                }
            )
        except Exception as e:
            return ChatResponse(
                success=False,
                error={
                    "code": "API_ERROR",
                    "message": f"OpenAI API error: {str(e)}"
                }
            )

    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "ERROR",
                "message": f"Chat error: {str(e)}"
            }
        )