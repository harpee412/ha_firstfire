"""
Domain Agent - Base class for Home Assistant domain-specific agents
Handles entities in a specific domain (lights, switches, sensors, etc.)
"""

import json
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI, OpenAIError
from ..config import get_config
from ..ha_client import HomeAssistantClient
from .base import BaseAgent


class DomainAgent(BaseAgent):
    """
    Base class for domain-specific agents (lights, switches, sensors, etc.)

    Each domain agent:
    - Handles only entities in its domain
    - Parses user intent first (lightweight)
    - Fetches only necessary data
    - Returns focused, token-efficient responses
    """

    def __init__(self, domain: str):
        """
        Initialize domain agent

        Args:
            domain: HA domain (e.g., "light", "switch", "sensor", "climate")
        """
        self.domain = domain
        self.domain_name = self._friendly_domain_name(domain)
        super().__init__(
            name=f"{domain.title()}Agent",
            description=f"Manages {self.domain_name} entities and operations"
        )
        self.client = AsyncOpenAI(api_key=get_config().openai_token)
        self.ha_client = HomeAssistantClient()
        self.model = get_config().model
        self.max_tokens = get_config().max_tokens

    @staticmethod
    def _friendly_domain_name(domain: str) -> str:
        """Convert domain code to friendly name"""
        names = {
            "light": "lights",
            "switch": "switches",
            "sensor": "sensors",
            "climate": "climate control",
            "cover": "covers/blinds",
            "lock": "locks",
            "fan": "fans",
            "water_heater": "water heaters",
            "input_boolean": "toggles",
            "input_number": "sliders",
        }
        return names.get(domain, f"{domain} devices")

    def _build_system_prompt(self) -> str:
        """Build system prompt for domain agent"""
        return f"""You are FirstFire's {self.domain_name.title()} Agent.

Your role is to:
1. Answer questions about {self.domain_name} in the user's Home Assistant
2. Control {self.domain_name} (turn on/off, adjust settings, etc.)
3. Explain current states and configurations
4. Suggest optimizations and automations
5. Help troubleshoot issues
6. Guide users through setup and configuration

IMPORTANT - You can take action:
- When user asks to control {self.domain_name}, I've pre-matched relevant entities to their request
- Use the "Matching entities found" list to identify what they want
- If one clear match exists, execute it with a confirmation ("Turning off basement desk light...")
- If multiple matches, show them and ask which one they meant
- Report success/failure clearly with new state

Context: You have full access to current {self.domain_name} data and control.
The matching entities are already identified for you - just use them.

Always respond in Markdown format for clarity. Be concise and focused on {self.domain_name}.
When showing state or configuration, use code blocks and lists for readability."""

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process message with domain-specific context

        Args:
            user_message: User's question about this domain

        Returns:
            Dict with response, token count, and metadata
        """
        try:
            # Step 1: Parse intent (lightweight, no HA call yet)
            intent = self._parse_intent(user_message)

            # Step 2: Fetch only data needed for this intent
            domain_data = await self._fetch_domain_data(intent)

            # Step 3: For control intents, try to find matching entities
            entity_matches = ""
            if intent == "control":
                entities_result = await self.ha_client.get_entities()
                if entities_result.get("success"):
                    all_entities = entities_result.get("data", [])
                    domain_entities = [
                        e for e in all_entities
                        if e.get("entity_id", "").startswith(f"{self.domain}.")
                    ]
                    matches = self._find_matching_entities(user_message, domain_entities)
                    if matches:
                        entity_matches = "\n\nMatching entities found:\n"
                        for entity in matches[:5]:  # Top 5 matches
                            name = entity.get("attributes", {}).get("friendly_name", entity.get("entity_id"))
                            entity_id = entity.get("entity_id")
                            state = entity.get("state")
                            entity_matches += f"- **{name}** (`{entity_id}`) - State: {state}\n"

            # Step 4: Call Claude with focused context
            user_context = f"""Current {self.domain_name} Status:
{domain_data}{entity_matches}

User Question: {user_message}"""

            messages = [
                {
                    "role": "system",
                    "content": self.system_prompt
                },
                {
                    "role": "user",
                    "content": user_context
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
                    "agent": f"{self.domain_name.title()} Agent",
                    "domain": self.domain,
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
                "error": f"{self.domain.title()}Agent error: {str(e)}",
                "tokens_used": 0,
            }

    def _parse_intent(self, user_message: str) -> str:
        """
        Lightweight intent parsing without LLM calls

        Returns categories like: "status", "control", "config", "help"
        """
        message_lower = user_message.lower()

        if any(word in message_lower for word in ["turn on", "turn off", "set", "change", "adjust"]):
            return "control"
        elif any(word in message_lower for word in ["how many", "what is", "show", "list", "count"]):
            return "status"
        elif any(word in message_lower for word in ["config", "setup", "automations", "schedule"]):
            return "config"
        elif any(word in message_lower for word in ["help", "what can", "how do", "explain"]):
            return "help"
        else:
            return "general"

    def _find_matching_entities(self, user_query: str, entities: List[Dict]) -> List[Dict]:
        """
        Find entities matching user's description using fuzzy matching

        Returns list of matching entities, sorted by relevance.
        Example: "basement desk" matches "light.basement_desk_light1"
        """
        if not entities:
            return []

        query_words = user_query.lower().split()
        matches = []

        for entity in entities:
            entity_id = entity.get("entity_id", "")
            friendly_name = entity.get("attributes", {}).get("friendly_name", "").lower()

            # Score based on matching words
            score = 0

            # Check entity_id (e.g., "light.basement_desk_light1" → "basement", "desk", "light1")
            entity_parts = entity_id.lower().replace(".", "_").replace("-", "_").split("_")

            # Check friendly_name (e.g., "Basement Desk Light" → "basement", "desk", "light")
            name_parts = friendly_name.lower().replace("-", " ").split()

            # Score: how many query words are in the entity
            for word in query_words:
                if word in entity_parts or word in name_parts:
                    score += 2
                # Partial matches
                if any(word in part for part in entity_parts + name_parts):
                    score += 1

            if score > 0:
                matches.append((score, entity))

        # Return sorted by relevance (highest score first)
        return [entity for score, entity in sorted(matches, key=lambda x: x[0], reverse=True)]

    async def _fetch_domain_data(self, intent: str) -> str:
        """
        Fetch only data needed for the given intent

        Different intents need different data:
        - status: entity counts and states
        - control: specific entity details
        - config: configuration and automations
        """
        try:
            entities = await self.ha_client.get_entities()
            if not entities.get("success"):
                return "Unable to fetch entity data"

            # Filter to this domain only
            domain_entities = [
                e for e in entities.get("data", [])
                if e.get("entity_id", "").startswith(f"{self.domain}.")
            ]

            if not domain_entities:
                return f"No {self.domain_name} found in your system"

            if intent == "status":
                return self._format_status(domain_entities)
            elif intent == "control":
                return self._format_control(domain_entities)
            elif intent == "config":
                return self._format_config(domain_entities)
            else:
                return self._format_summary(domain_entities)

        except Exception as e:
            return f"Error fetching data: {str(e)}"

    def _format_status(self, entities: List[Dict]) -> str:
        """Format for status queries (count and summary)"""
        output = [f"**Total {self.domain_name}:** {len(entities)}"]

        # Group by state
        states = {}
        for entity in entities:
            state = entity.get("state", "unknown")
            name = entity.get("attributes", {}).get("friendly_name", entity.get("entity_id"))
            if state not in states:
                states[state] = []
            states[state].append(name)

        for state, items in sorted(states.items()):
            output.append(f"\n**{state.title()}:** ({len(items)})")
            for item in items[:5]:  # Limit to 5 per state
                output.append(f"  - {item}")
            if len(items) > 5:
                output.append(f"  - ... and {len(items) - 5} more")

        return "\n".join(output)

    def _format_control(self, entities: List[Dict]) -> str:
        """Format for control queries (all details)"""
        output = [f"**{self.domain_name.title()} Entities:**"]

        for entity in entities[:10]:  # Limit to 10
            name = entity.get("attributes", {}).get("friendly_name", entity.get("entity_id"))
            state = entity.get("state")
            entity_id = entity.get("entity_id")
            output.append(f"\n- **{name}** (`{entity_id}`)")
            output.append(f"  State: `{state}`")

        if len(entities) > 10:
            output.append(f"\n... and {len(entities) - 10} more")

        return "\n".join(output)

    def _format_config(self, entities: List[Dict]) -> str:
        """Format for config/setup queries"""
        output = [f"**{self.domain_name.title()} Configuration:**"]
        output.append(f"- Total entities: {len(entities)}")

        # Show unique entity features
        features = set()
        for entity in entities:
            attrs = entity.get("attributes", {})
            for key in attrs.keys():
                if key not in ["friendly_name", "icon", "entity_id"]:
                    features.add(key)

        if features:
            output.append("\n**Available Features:**")
            for feature in sorted(list(features))[:10]:
                output.append(f"- {feature}")

        return "\n".join(output)

    def _format_summary(self, entities: List[Dict]) -> str:
        """Format for general queries"""
        states = {}
        for entity in entities:
            state = entity.get("state", "unknown")
            states[state] = states.get(state, 0) + 1

        output = [f"**{self.domain_name.title()} Summary:**"]
        output.append(f"Total: {len(entities)} entities")

        for state, count in sorted(states.items()):
            output.append(f"- {state.title()}: {count}")

        return "\n".join(output)
