"""
FirstFire Configuration Management Module

Handles loading, validation, and management of application configuration
from config.yaml, environment variables, and runtime updates.
"""

import os
import re
from typing import Optional
from pathlib import Path
from pydantic import BaseModel, Field, field_validator


class FirstFireConfig(BaseModel):
    """FirstFire application configuration"""

    openai_token: Optional[str] = Field(
        default=None,
        description="OpenAI API token (sk-...)"
    )
    max_tokens: int = Field(
        default=500,
        ge=100,
        le=4000,
        description="Maximum tokens per OpenAI response"
    )
    model: str = Field(
        default="gpt-4-turbo",
        description="OpenAI model to use"
    )
    system_prompt: str = Field(
        default="You are a friendly and helpful assistant for Home Assistant setup and configuration. Keep responses concise, practical, and easy to understand. Use emojis sparingly to add personality.",
        description="System prompt for the AI assistant"
    )

    # InfluxDB configuration (optional)
    influxdb_url: Optional[str] = Field(
        default=None,
        description="InfluxDB URL (e.g., http://influxdb:8086)"
    )
    influxdb_token: Optional[str] = Field(
        default=None,
        description="InfluxDB API token (v2) or password (v1)"
    )
    influxdb_username: Optional[str] = Field(
        default=None,
        description="InfluxDB username (v1 only)"
    )
    influxdb_org: Optional[str] = Field(
        default="home-assistant",
        description="InfluxDB organization name (v2) or database name (v1)"
    )
    influxdb_bucket: Optional[str] = Field(
        default="home_assistant",
        description="InfluxDB bucket name (v2 only)"
    )
    influxdb_v1: Optional[bool] = Field(
        default=False,
        description="Use InfluxDB 1.x authentication (username/password instead of token)"
    )

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: str) -> str:
        """Validate that model is one of the allowed options"""
        allowed_models = ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
        if v not in allowed_models:
            raise ValueError(f"Model must be one of {allowed_models}")
        return v

    @field_validator("openai_token", mode="before")
    @classmethod
    def validate_token_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate OpenAI token format if provided"""
        if v is None or v == "":
            return None

        if not isinstance(v, str):
            raise ValueError("Token must be a string")

        # Basic format check: OpenAI tokens start with "sk-"
        if not v.startswith("sk-"):
            raise ValueError("Invalid OpenAI token format. Token must start with 'sk-'")

        if len(v) < 20:
            raise ValueError("OpenAI token appears too short")

        return v.strip()

    class Config:
        """Pydantic model configuration"""
        validate_assignment = True

    def is_configured(self) -> bool:
        """Check if OpenAI token is configured"""
        return bool(self.openai_token)

    def is_influxdb_configured(self) -> bool:
        """Check if InfluxDB is configured"""
        return bool(self.influxdb_url and self.influxdb_token)

    def to_dict(self) -> dict:
        """Convert config to dictionary, hiding sensitive data"""
        return {
            "configured": self.is_configured(),
            "model": self.model,
            "max_tokens": self.max_tokens,
            "openai_token_masked": self._mask_token() if self.openai_token else None,
            "influxdb_configured": self.is_influxdb_configured(),
            "influxdb_url": self.influxdb_url,
            "influxdb_org": self.influxdb_org,
            "influxdb_bucket": self.influxdb_bucket,
        }

    def _mask_token(self) -> str:
        """Return masked version of token for display"""
        if not self.openai_token or len(self.openai_token) < 8:
            return "sk-..."
        return f"{self.openai_token[:7]}...{self.openai_token[-4:]}"


class ConfigManager:
    """Manages FirstFire configuration from multiple sources"""

    def __init__(self, config_file: Optional[Path] = None):
        """
        Initialize config manager

        Args:
            config_file: Path to config.yaml (defaults to looking for it in parent)
        """
        self.config_file = config_file or self._find_config_file()
        self.config: FirstFireConfig = self._load_config()

    @staticmethod
    def _find_config_file() -> Optional[Path]:
        """Find config.yaml in parent directories"""
        # Check up to 3 levels up from this file
        current = Path(__file__).resolve().parent
        for _ in range(3):
            config_path = current / "config.yaml"
            if config_path.exists():
                return config_path
            current = current.parent
        return None

    def _load_config(self) -> FirstFireConfig:
        """
        Load configuration from multiple sources in priority order:
        1. Home Assistant options.json (highest priority - user config)
        2. Environment variables
        3. config.yaml defaults
        4. Code defaults
        """
        config_data = {}

        # Load from Home Assistant options.json (highest priority)
        try:
            options_path = Path("/data/options.json")
            if options_path.exists():
                import json
                with open(options_path, "r") as f:
                    ha_options = json.load(f)
                    if "openai_token" in ha_options and ha_options["openai_token"]:
                        config_data["openai_token"] = ha_options["openai_token"]
                    if "model" in ha_options and ha_options["model"]:
                        config_data["model"] = ha_options["model"]
                    if "max_tokens" in ha_options and ha_options["max_tokens"]:
                        config_data["max_tokens"] = ha_options["max_tokens"]
                    if "system_prompt" in ha_options and ha_options["system_prompt"]:
                        config_data["system_prompt"] = ha_options["system_prompt"]
                    # InfluxDB config
                    if "influxdb_url" in ha_options and ha_options["influxdb_url"]:
                        config_data["influxdb_url"] = ha_options["influxdb_url"]
                    if "influxdb_token" in ha_options and ha_options["influxdb_token"]:
                        config_data["influxdb_token"] = ha_options["influxdb_token"]
                    if "influxdb_org" in ha_options and ha_options["influxdb_org"]:
                        config_data["influxdb_org"] = ha_options["influxdb_org"]
                    if "influxdb_bucket" in ha_options and ha_options["influxdb_bucket"]:
                        config_data["influxdb_bucket"] = ha_options["influxdb_bucket"]
        except Exception as e:
            print(f"Note: Could not load Home Assistant options.json: {e}")

        # Load from environment variables (if not set by HA options)
        env_token = os.getenv("OPENAI_API_KEY")
        if env_token and "openai_token" not in config_data:
            config_data["openai_token"] = env_token

        env_model = os.getenv("OPENAI_MODEL")
        if env_model:
            config_data["model"] = env_model

        env_max_tokens = os.getenv("OPENAI_MAX_TOKENS")
        if env_max_tokens:
            try:
                config_data["max_tokens"] = int(env_max_tokens)
            except ValueError:
                pass  # Ignore invalid values, use default

        env_system_prompt = os.getenv("FIRSTFIRE_SYSTEM_PROMPT")
        if env_system_prompt:
            config_data["system_prompt"] = env_system_prompt

        # InfluxDB environment variables
        env_influxdb_url = os.getenv("INFLUXDB_URL")
        if env_influxdb_url:
            config_data["influxdb_url"] = env_influxdb_url

        env_influxdb_token = os.getenv("INFLUXDB_TOKEN")
        if env_influxdb_token:
            config_data["influxdb_token"] = env_influxdb_token

        env_influxdb_org = os.getenv("INFLUXDB_ORG")
        if env_influxdb_org:
            config_data["influxdb_org"] = env_influxdb_org

        env_influxdb_bucket = os.getenv("INFLUXDB_BUCKET")
        if env_influxdb_bucket:
            config_data["influxdb_bucket"] = env_influxdb_bucket

        # Load from config.yaml (would be set by Home Assistant)
        if self.config_file and self.config_file.exists():
            try:
                import yaml
                with open(self.config_file, "r") as f:
                    config_yaml = yaml.safe_load(f)
                    if config_yaml and "options" in config_yaml:
                        options = config_yaml["options"]
                        # Only use values that aren't already set by env vars
                        if "openai_token" in options and not env_token:
                            config_data["openai_token"] = options["openai_token"]
                        if "model" in options and not env_model:
                            config_data["model"] = options["model"]
                        if "max_tokens" in options and not env_max_tokens:
                            config_data["max_tokens"] = options["max_tokens"]
                        if "system_prompt" in options and not env_system_prompt:
                            config_data["system_prompt"] = options["system_prompt"]
            except Exception as e:
                # Silently continue if YAML parsing fails
                print(f"Warning: Could not load config.yaml: {e}")

        # Create config with whatever we loaded
        return FirstFireConfig(**config_data)

    def update_token(self, token: str) -> tuple[bool, Optional[str]]:
        """
        Update and validate OpenAI token

        Args:
            token: OpenAI token to set

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            self.config.openai_token = token
            return True, None
        except ValueError as e:
            return False, str(e)

    def update_influxdb(
        self,
        url: str,
        token_or_password: str,
        org_or_database: Optional[str] = None,
        bucket: Optional[str] = None,
        username: Optional[str] = None,
        use_v1: bool = False,
    ) -> tuple[bool, Optional[str]]:
        """
        Update InfluxDB configuration

        Args:
            url: InfluxDB URL
            token_or_password: API token (v2) or password (v1)
            org_or_database: Organization (v2) or database name (v1)
            bucket: Bucket name (v2 only)
            username: Username (v1 only)
            use_v1: Force use of InfluxDB 1.x

        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        try:
            if not url or not token_or_password:
                return False, "URL and token/password are required"

            self.config.influxdb_url = url
            self.config.influxdb_token = token_or_password
            self.config.influxdb_username = username
            self.config.influxdb_v1 = use_v1

            if org_or_database:
                self.config.influxdb_org = org_or_database
            if bucket:
                self.config.influxdb_bucket = bucket

            return True, None
        except Exception as e:
            return False, str(e)

    def get_config(self) -> FirstFireConfig:
        """Get current configuration"""
        return self.config

    def get_status(self) -> dict:
        """Get configuration status for frontend"""
        return self.config.to_dict()


# Global config manager instance
_config_manager: Optional[ConfigManager] = None


def get_config_manager() -> ConfigManager:
    """Get or create global config manager"""
    global _config_manager
    if _config_manager is None:
        _config_manager = ConfigManager()
    return _config_manager


def get_config() -> FirstFireConfig:
    """Get current configuration"""
    return get_config_manager().get_config()
