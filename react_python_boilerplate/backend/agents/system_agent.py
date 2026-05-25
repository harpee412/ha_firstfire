"""
SystemAgent - High-level overview of Home Assistant system
Provides counts and status without dumping raw data
Routes to specialized agents for domain-specific questions
"""

from typing import Dict, Any
from openai import AsyncOpenAI, OpenAIError
from ..config import get_config
from ..ha_client import HomeAssistantClient
from .base import BaseAgent


class SystemAgent(BaseAgent):
    """
    System Agent with direct HA API integration
    Provides high-level visibility into:
    - Entities (lights, switches, sensors, etc.)
    - Automations
    - Integrations
    - System metrics and status
    """

    def __init__(self):
        """Initialize SystemAgent with HA client and Claude"""
        super().__init__(
            name="SystemAgent",
            description="Home Assistant system overview with real-time entity and automation visibility"
        )
        self.client = AsyncOpenAI(api_key=get_config().openai_token)
        self.ha_client = HomeAssistantClient()
        self.model = get_config().model
        self.max_tokens = get_config().max_tokens

    def _build_system_prompt(self) -> str:
        """Build system prompt for SystemAgent"""
        return """You are FirstFire's System Agent - the general-purpose guide for Home Assistant.

Your role is to:
1. Provide high-level system status and overview
2. Answer general Home Assistant questions
3. Control devices generically when needed (turn on/off, toggle)
4. Explain when to ask other specialized agents (LightAgent, SwitchAgent, AutomationAgent)
5. Guide users on Home Assistant best practices
6. Help users understand their system structure

IMPORTANT: You have access to high-level system counts but NOT raw device data.
- For specific light control/queries: suggest the LightAgent ("Ask me about lights")
- For specific switch/plug control/queries: suggest the SwitchAgent ("Ask me about switches")
- For automation help: suggest the AutomationAgent ("Ask me about automations")

You can take basic actions:
- Generic turn on/off for any device
- Toggle any entity
- But specialists are better for domain-specific control

Always respond in Markdown format. Be helpful and route users to specialists when it makes sense.

Key principles:
- Be concise and high-level
- Suggest specialized agents for domain-specific actions
- Highlight system status and configuration
- Provide practical guidance"""

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process message with high-level system context

        Note: SystemAgent does NOT use tool calls. It provides high-level
        system status and routes users to specialized domain agents.

        Args:
            user_message: User's question about the system

        Returns:
            Dict with response, token count, and metadata
        """
        try:
            # Gather system context (counts only, no raw data)
            system_context = await self._gather_system_context()

            # Initial message with minimal context
            messages = [
                {
                    "role": "system",
                    "content": self.system_prompt
                },
                {
                    "role": "user",
                    "content": f"""System Context:
{system_context}

User Question: {user_message}

Note: For specific domain questions (lights, switches, automations), the user's agent router
will automatically route to specialized agents. But you can provide guidance here."""
                }
            ]

            # Call OpenAI WITHOUT tools - just direct response
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=self.max_tokens,
                messages=messages
                # NO tools - we're keeping context lean to avoid token overflow
            )

            tokens_used = response.usage.total_tokens if response.usage else 0

            return {
                "success": True,
                "response": response.choices[0].message.content or "No response",
                "tokens_used": tokens_used,
                "metadata": {
                    "agent": "SystemAgent",
                    "model": self.model,
                }
            }

        except OpenAIError as e:
            return {
                "success": False,
                "error": f"OpenAI API error: {str(e)}",
                "tokens_used": 0,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"SystemAgent error: {str(e)}",
                "tokens_used": 0,
            }

    async def _gather_system_context(self) -> str:
        """Gather minimal system context (only counts/summary, not raw data)"""
        context_parts = []

        try:
            # System info
            sys_info = await self.ha_client.get_system_info()
            if sys_info.get("success"):
                info = sys_info.get("data", {})
                context_parts.append(f"**Version:** {info.get('version', 'Unknown')}")
                context_parts.append(f"**Unit Name:** {info.get('unit_name', 'Unknown')}")
        except:
            pass

        try:
            # Entity count only (no raw data)
            entities = await self.ha_client.get_entities()
            if entities.get("success"):
                entity_list = entities.get("data", [])
                entity_counts = self._count_entity_types(entity_list)
                context_parts.append(f"**Total Entities:** {len(entity_list)}")
                # Show only top entity types
                top_types = sorted(entity_counts.items(), key=lambda x: x[1], reverse=True)[:5]
                for etype, count in top_types:
                    context_parts.append(f"  - {etype}: {count}")
        except:
            pass

        try:
            # Automation count only
            automations = await self.ha_client.get_automations()
            if automations.get("success"):
                auto_list = automations.get("data", [])
                context_parts.append(f"**Automations:** {len(auto_list)}")
        except:
            pass

        try:
            # Integration count only
            integrations = await self.ha_client.get_integrations()
            if integrations.get("success"):
                int_list = integrations.get("data", [])
                context_parts.append(f"**Integrations:** {len(int_list)}")
        except:
            pass

        if not context_parts:
            context_parts.append("**Status:** System context gathering")

        return "\n".join(context_parts)

    def _count_entity_types(self, entities: list) -> Dict[str, int]:
        """Count entities by type"""
        counts = {}
        for entity in entities:
            etype = entity.get("entity_id", "").split(".")[0]
            counts[etype] = counts.get(etype, 0) + 1
        return dict(sorted(counts.items()))

