"""
FirstFire API Routes

Handles configuration, validation, and agent-powered chat endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from ..config import get_config_manager, get_config, FirstFireConfig
from ..agents.agent_router import AgentRouter
from ..conversation import get_conversation_manager
from ..influxdb_client import init_influxdb, get_influxdb_client
import openai

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class ChatRequest(BaseModel):
    """Chat message request with conversation support"""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None  # If None, creates new conversation


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


class InfluxDBConfigRequest(BaseModel):
    """InfluxDB configuration request"""
    url: str = Field(..., min_length=1)
    token: str = Field(..., min_length=1, description="API token (v2) or password (v1)")
    org: Optional[str] = "home-assistant"
    bucket: Optional[str] = "home_assistant"
    username: Optional[str] = None
    use_v1: Optional[bool] = False


class InfluxDBStatus(BaseModel):
    """InfluxDB status response"""
    configured: bool
    url: Optional[str] = None
    org: Optional[str] = None
    bucket: Optional[str] = None
    connected: bool = False


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
    except Exception as e:
        return ValidationResponse(
            success=False,
            valid=False,
            error=f"Validation error: {str(e)}"
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
    """
    Send a message to FirstFire's multi-agent system with conversation history

    The router automatically selects the appropriate agent:
    - LightAgent for lighting questions
    - SwitchAgent for switch/device control
    - AutomationAgent for automation help
    - SystemAgent for general system questions

    All agents have direct Home Assistant API access and return
    markdown-formatted responses for readability.

    Conversation history is maintained per conversation_id, allowing agents
    to remember context across multiple turns.
    """
    try:
        config = get_config()

        # Check if OpenAI token is configured
        if not config.is_configured():
            return ChatResponse(
                success=False,
                error={
                    "code": "NOT_CONFIGURED",
                    "message": "OpenAI API token not configured. Please configure it in settings."
                }
            )

        # Initialize or retrieve conversation
        conv_manager = get_conversation_manager()
        if not request.conversation_id:
            conversation_id = conv_manager.create_conversation()
        else:
            conversation_id = request.conversation_id

        # Get conversation history
        history = conv_manager.get_history(conversation_id)

        # Add user message to history
        conv_manager.add_message(conversation_id, "user", request.message)

        # Route to appropriate agent based on message content
        router = AgentRouter()
        result = await router.route(request.message, history=history)

        # Add agent response to history
        response_text = result.get("response", "")
        conv_manager.add_message(conversation_id, "assistant", response_text)

        if result.get("success"):
            return ChatResponse(
                success=True,
                data={
                    "response": response_text,
                    "tokens_used": result.get("tokens_used", 0),
                    "agent": result.get("metadata", {}).get("agent", "Unknown"),
                    "router_selected": result.get("metadata", {}).get("router_selected", "Unknown"),
                    "conversation_id": conversation_id,
                }
            )
        else:
            error_message = result.get("error", "Unknown agent error")
            return ChatResponse(
                success=False,
                error={
                    "code": "AGENT_ERROR",
                    "message": error_message
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


# ============================================================================
# InfluxDB Analytics Routes
# ============================================================================

@router.post("/influxdb/config", response_model=ChatResponse)
async def configure_influxdb(request: InfluxDBConfigRequest) -> ChatResponse:
    """Configure InfluxDB connection for analytics (supports v1.x and v2.x)"""
    try:
        config_manager = get_config_manager()
        success, error = config_manager.update_influxdb(
            url=request.url,
            token_or_password=request.token,
            org_or_database=request.org,
            bucket=request.bucket,
            username=request.username,
            use_v1=request.use_v1 or bool(request.username),  # Use v1 if username provided
        )

        if not success:
            return ChatResponse(
                success=False,
                error={"code": "CONFIG_ERROR", "message": error}
            )

        # Try to initialize connection
        try:
            client = init_influxdb(
                url=request.url,
                token_or_password=request.token,
                org_or_database=request.org or ("homeassistant" if request.username else "home-assistant"),
                bucket=request.bucket or "home_assistant",
                username=request.username,
                use_v1=request.use_v1 or bool(request.username),
            )

            if client.is_connected():
                return ChatResponse(
                    success=True,
                    data={
                        "message": "InfluxDB configured and connected successfully",
                        "status": config_manager.get_status()
                    }
                )
            else:
                return ChatResponse(
                    success=False,
                    error={
                        "code": "CONNECTION_FAILED",
                        "message": "InfluxDB configuration saved but connection test failed"
                    }
                )
        except Exception as e:
            return ChatResponse(
                success=False,
                error={
                    "code": "CONNECTION_ERROR",
                    "message": f"Failed to connect to InfluxDB: {str(e)}"
                }
            )

    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "CONFIG_ERROR",
                "message": f"Configuration error: {str(e)}"
            }
        )


@router.get("/influxdb/status", response_model=ChatResponse)
async def get_influxdb_status() -> ChatResponse:
    """Get InfluxDB configuration and connection status"""
    try:
        config = get_config()
        influxdb = get_influxdb_client()

        return ChatResponse(
            success=True,
            data={
                "configured": config.is_influxdb_configured(),
                "url": config.influxdb_url,
                "org": config.influxdb_org,
                "bucket": config.influxdb_bucket,
                "connected": influxdb.is_connected() if influxdb else False,
            }
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "ERROR",
                "message": str(e)
            }
        )


@router.post("/influxdb/test", response_model=ChatResponse)
async def test_influxdb_connection() -> ChatResponse:
    """Test InfluxDB connection"""
    try:
        influxdb = get_influxdb_client()

        if not influxdb:
            return ChatResponse(
                success=False,
                error={
                    "code": "NOT_CONFIGURED",
                    "message": "InfluxDB is not configured"
                }
            )

        if influxdb.is_connected():
            return ChatResponse(
                success=True,
                data={"message": "InfluxDB connection successful"}
            )
        else:
            return ChatResponse(
                success=False,
                error={
                    "code": "CONNECTION_FAILED",
                    "message": "InfluxDB connection test failed"
                }
            )

    except Exception as e:
        return ChatResponse(
            success=False,
            error={
                "code": "ERROR",
                "message": f"Test error: {str(e)}"
            }
        )
