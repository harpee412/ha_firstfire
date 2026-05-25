"""
Automation Agent - Specializes in Home Assistant automations
"""

import json
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI, OpenAIError
from ..config import get_config
from ..ha_client import HomeAssistantClient
from .base import BaseAgent


class AutomationAgent(BaseAgent):
    """
    Agent for managing Home Assistant automations

    Capabilities:
    - Understand current automations and their triggers/actions
    - Suggest new automation patterns
    - Explain automation logic
    - Help create new automations
    - Optimize existing automations
    """

    def __init__(self):
        super().__init__(
            name="AutomationAgent",
            description="Manages Home Assistant automations and automation suggestions"
        )
        self.client = AsyncOpenAI(api_key=get_config().openai_token)
        self.ha_client = HomeAssistantClient()
        self.model = get_config().model
        self.max_tokens = get_config().max_tokens

    def _build_system_prompt(self) -> str:
        """Build system prompt for automation agent"""
        return """You are FirstFire's Automation Agent - the expert on Home Assistant automations.

Your role is to:
1. Explain what automations are running and how they work
2. Identify gaps where automations could improve the user's home
3. Suggest new automation patterns based on current setup
4. Help users create and refine automations
5. Enable and disable automations as needed
6. Optimize automation rules and conditions
7. Troubleshoot automation issues

You understand automation structure:
- **Triggers:** What starts the automation (time, event, state change)
- **Conditions:** When the trigger is allowed to execute (optional checks)
- **Actions:** What happens when triggered (service calls, notifications, scenes)

You can take action on automations:
- "Disable the motion sensor automation" → Turn off the automation
- "Enable my morning routine" → Turn on the automation
- "Create a bedtime automation" → Guide user through creation
- Always explain what you're doing before executing

Always respond in Markdown format. When showing automations:
- Use clear headers for trigger, condition, and action
- Explain what each automation does in plain English
- Group related automations together
- Suggest improvements for reliability and efficiency

Be helpful and practical. Focus on creating useful automations that improve daily life."""

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process message with automation-specific context

        Args:
            user_message: User's question about automations

        Returns:
            Dict with response, token count, and metadata
        """
        try:
            # Parse intent
            intent = self._parse_intent(user_message)

            # Fetch automation data based on intent
            auto_context = await self._fetch_automation_context(intent)

            # Prepare messages
            messages = [
                {
                    "role": "system",
                    "content": self.system_prompt
                },
                {
                    "role": "user",
                    "content": f"""Current Automation Status:
{auto_context}

User Question: {user_message}"""
                }
            ]

            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=self.max_tokens,
                messages=messages
            )

            tokens_used = response.usage.total_tokens if response.usage else 0

            return {
                "success": True,
                "response": response.choices[0].message.content or "No response",
                "tokens_used": tokens_used,
                "metadata": {
                    "agent": "Automation Agent",
                    "intent": intent,
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
                "error": f"AutomationAgent error: {str(e)}",
                "tokens_used": 0,
            }

    def _parse_intent(self, user_message: str) -> str:
        """Parse intent for automation queries"""
        message_lower = user_message.lower()

        if any(word in message_lower for word in ["create", "make", "new", "add", "setup"]):
            return "create"
        elif any(word in message_lower for word in ["how many", "what are", "list", "show", "have"]):
            return "list"
        elif any(word in message_lower for word in ["explain", "how does", "what does", "tell me"]):
            return "explain"
        elif any(word in message_lower for word in ["suggest", "recommend", "should", "could i"]):
            return "suggest"
        elif any(word in message_lower for word in ["problem", "broken", "issue", "not working"]):
            return "troubleshoot"
        else:
            return "general"

    async def _fetch_automation_context(self, intent: str) -> str:
        """
        Fetch automation data based on intent

        Different intents need different detail levels:
        - list: just names and basic info
        - explain: full details
        - suggest: summary with gap analysis
        """
        try:
            auto_result = await self.ha_client.get_automations()
            if not auto_result.get("success"):
                return "No automations found or unable to fetch data"

            automations = auto_result.get("data", [])

            if not automations:
                return "**No automations configured yet.** This is a good opportunity to set up some useful ones!"

            if intent == "list":
                return self._format_automation_list(automations)
            elif intent == "explain":
                return self._format_automation_details(automations)
            elif intent == "suggest":
                return self._format_automation_summary(automations)
            else:
                return self._format_automation_summary(automations)

        except Exception as e:
            return f"Error fetching automations: {str(e)}"

    def _format_automation_list(self, automations: List[Dict]) -> str:
        """Format automation list (names and status only)"""
        output = [f"**Automations ({len(automations)} total):**"]

        for auto in automations:
            name = auto.get("attributes", {}).get("friendly_name", auto.get("entity_id", "Unknown"))
            state = auto.get("state", "unknown")
            icon = "✓" if state == "on" else "✗"
            output.append(f"- {icon} **{name}** (`{state}`)")

        return "\n".join(output)

    def _format_automation_details(self, automations: List[Dict]) -> str:
        """Format automation details (full info)"""
        output = [f"**Automations ({len(automations)} total):**"]

        for auto in automations[:10]:  # Limit to 10 for token efficiency
            attrs = auto.get("attributes", {})
            name = attrs.get("friendly_name", auto.get("entity_id", "Unknown"))
            state = auto.get("state", "unknown")
            last_triggered = attrs.get("last_triggered", "Never")

            output.append(f"\n**{name}**")
            output.append(f"- Status: `{state}`")
            output.append(f"- Last Triggered: {last_triggered}")

            # Show description if available
            description = attrs.get("description")
            if description:
                output.append(f"- Description: {description}")

        if len(automations) > 10:
            output.append(f"\n... and {len(automations) - 10} more automations")

        return "\n".join(output)

    def _format_automation_summary(self, automations: List[Dict]) -> str:
        """Format automation summary for suggestions"""
        enabled_count = sum(1 for a in automations if a.get("state") == "on")
        disabled_count = len(automations) - enabled_count

        output = [
            "**Automation Summary:**",
            f"- Total automations: {len(automations)}",
            f"- Enabled: {enabled_count}",
            f"- Disabled: {disabled_count}",
        ]

        # Show recently triggered
        recently_triggered = []
        for auto in automations:
            last = auto.get("attributes", {}).get("last_triggered")
            if last and last != "Never":
                name = auto.get("attributes", {}).get("friendly_name", auto.get("entity_id"))
                recently_triggered.append((name, last))

        if recently_triggered:
            output.append("\n**Recently Triggered:**")
            for name, last in recently_triggered[:3]:
                output.append(f"- {name}: {last}")

        output.append(
            "\n**Suggestion Areas:**\n"
            "Based on your setup, you could benefit from automations for:\n"
            "- Time-based scenes (morning routine, bedtime, away mode)\n"
            "- Presence-based triggers (arrivals, departures)\n"
            "- Energy optimization (turning off unused devices)\n"
            "- Safety alerts (doors/windows, temperatures)\n"
            "\nAsk me to help create new automations!"
        )

        return "\n".join(output)

    # =========================================================================
    # Automation Control Actions
    # =========================================================================

    async def enable_automation(self, entity_id: str) -> Dict[str, Any]:
        """Enable an automation (turn it on)"""
        return await self.ha_client.turn_on_entity(entity_id)

    async def disable_automation(self, entity_id: str) -> Dict[str, Any]:
        """Disable an automation (turn it off)"""
        return await self.ha_client.turn_off_entity(entity_id)

    async def toggle_automation(self, entity_id: str) -> Dict[str, Any]:
        """Toggle an automation on/off"""
        return await self.ha_client.toggle_entity(entity_id)
