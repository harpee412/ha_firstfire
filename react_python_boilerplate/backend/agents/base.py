"""
Base Agent class for extensible agent architecture
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseAgent(ABC):
    """
    Base class for all agents in FirstFire system

    Agents are specialized LLM instances with specific tools and context
    for different domains (system overview, automations, troubleshooting, etc.)
    """

    def __init__(self, name: str, description: str):
        """
        Initialize base agent

        Args:
            name: Agent name (e.g., "SystemAgent", "AutomationAgent")
            description: Agent purpose and capabilities
        """
        self.name = name
        self.description = description
        self.system_prompt = self._build_system_prompt()

    @abstractmethod
    def _build_system_prompt(self) -> str:
        """Build the system prompt for this agent"""
        pass

    @abstractmethod
    async def process_message(self, user_message: str, history: list = None) -> Dict[str, Any]:
        """
        Process user message and return response

        Args:
            user_message: User's question/request
            history: Conversation history (list of {role, content} dicts)

        Returns:
            Dict with keys:
            - response: Markdown-formatted response text
            - tokens_used: Token count
            - metadata: Agent-specific metadata
        """
        pass
