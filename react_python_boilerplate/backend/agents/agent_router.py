"""
Agent Router - Routes user messages to the appropriate agent
"""

from typing import Dict, Any
from .system_agent import SystemAgent
from .light_agent import LightAgent
from .switch_agent import SwitchAgent
from .automation_agent import AutomationAgent
from .analytics_agent import AnalyticsAgent
from .base import BaseAgent


class AgentRouter:
    """
    Routes user messages to domain-specific agents

    Strategy:
    1. Parse user intent from message
    2. Select appropriate agent
    3. Delegate to that agent
    4. Return response
    """

    def __init__(self):
        """Initialize router with all available agents"""
        self.system_agent = SystemAgent()
        self.light_agent = LightAgent()
        self.switch_agent = SwitchAgent()
        self.automation_agent = AutomationAgent()
        self.analytics_agent = AnalyticsAgent()

        # Map keywords to agents
        self.agent_keywords = {
            "light": self.light_agent,
            "lights": self.light_agent,
            "lighting": self.light_agent,
            "brightness": self.light_agent,
            "switch": self.switch_agent,
            "switches": self.switch_agent,
            "plug": self.switch_agent,
            "outlet": self.switch_agent,
            "relay": self.switch_agent,
            "automation": self.automation_agent,
            "automations": self.automation_agent,
            "automate": self.automation_agent,
            "schedule": self.automation_agent,
            "trigger": self.automation_agent,
            "history": self.analytics_agent,
            "trend": self.analytics_agent,
            "pattern": self.analytics_agent,
            "analytics": self.analytics_agent,
            "energy": self.analytics_agent,
            "consumption": self.analytics_agent,
            "stats": self.analytics_agent,
            "statistic": self.analytics_agent,
        }

    async def route(self, user_message: str, history: list = None) -> Dict[str, Any]:
        """
        Route user message to appropriate agent

        Args:
            user_message: User's query
            history: Conversation history for context

        Returns:
            Agent response
        """
        # Parse message to find domain
        agent = self._select_agent(user_message)

        # Delegate to agent with history
        response = await agent.process_message(user_message, history=history or [])

        # Add routing info to metadata
        if "metadata" in response:
            response["metadata"]["router_selected"] = agent.name

        return response

    def _select_agent(self, user_message: str) -> BaseAgent:
        """
        Select agent based on message content

        Priority:
        1. Direct keyword match (lights/switches/automations/analytics)
        2. Entity type detection (light entities vs switch entities)
        3. Action-based intent
        4. Default to SystemAgent
        """
        message_lower = user_message.lower()

        # Check for direct keyword matches - HIGHEST PRIORITY
        for keyword, agent in self.agent_keywords.items():
            if keyword in message_lower:
                return agent

        # Check for analytics intent (history, trends, patterns)
        if self._is_analytics_intent(message_lower):
            return self.analytics_agent

        # Check for action-based intent (specific control operations)
        if self._is_automation_intent(message_lower):
            return self.automation_agent

        # If no explicit keywords, but there's a location/room reference,
        # it's likely a LIGHT control (rooms are lights)
        if self._is_light_intent(message_lower):
            return self.light_agent

        # Control actions without explicit "light" keyword might still be lights
        # (e.g., "turn off basement desk" - could be lights or switches)
        # Default to light since more common than switches
        if any(phrase in message_lower for phrase in ["turn on", "turn off", "toggle", "dim", "brighten"]):
            return self.light_agent

        if self._is_switch_intent(message_lower):
            return self.switch_agent

        # Default to system agent for general queries
        return self.system_agent

    @staticmethod
    def _is_automation_intent(message: str) -> bool:
        """Check if message is asking about automations"""
        triggers = ["create", "setup", "configure", "how to", "can i set up"]
        return any(trigger in message for trigger in triggers) and any(
            word in message for word in ["time", "when", "if", "based on"]
        )

    @staticmethod
    def _is_light_intent(message: str) -> bool:
        """
        Check if message is about lights specifically
        Includes: brightness control, color, rooms, desk, etc.
        """
        light_words = [
            "bright", "dim", "color", "room",
            "living room", "bedroom", "kitchen", "basement", "garage",
            "desk", "hallway", "hallways", "porch", "deck", "patio",
            "office", "master", "upstairs", "downstairs", "laundry",
            "pantry", "mudroom", "bathroom", "closet", "shelf",
            "lamp", "lamps", "lighting", "glow", "hue"
        ]
        return any(word in message for word in light_words)

    @staticmethod
    def _is_switch_intent(message: str) -> bool:
        """Check if message is about switches specifically"""
        switch_words = ["turn on", "turn off", "power", "device"]
        return any(word in message for word in switch_words)

    @staticmethod
    def _is_analytics_intent(message: str) -> bool:
        """Check if message is requesting historical analysis or trends"""
        analytics_words = [
            "history", "historical", "trend", "pattern", "analytics",
            "energy", "consumption", "usage", "stats", "statistics",
            "over time", "how often", "when do", "average", "peak"
        ]
        return any(word in message for word in analytics_words)
