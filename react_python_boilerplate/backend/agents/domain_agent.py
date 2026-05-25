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

    async def process_message(self, user_message: str, history: list = None) -> Dict[str, Any]:
        """
        Process message with domain-specific context

        For CONTROL intents: Directly execute actions and verify
        For other intents: Use OpenAI for understanding and response

        Args:
            user_message: User's question about this domain
            history: Conversation history for context

        Returns:
            Dict with response, token count, and metadata
        """
        try:
            history = history or []

            # Step 1: Parse intent (lightweight, no HA call yet)
            intent = self._parse_intent(user_message)

            # Step 2: CONTROL INTENT - Execute actions directly
            if intent == "control":
                return await self._handle_control_intent(user_message)

            # Step 3: NON-CONTROL INTENT - Use OpenAI for response
            # Fetch only data needed for this intent
            domain_data = await self._fetch_domain_data(intent)

            # Step 4: Build messages with conversation history
            messages = [
                {
                    "role": "system",
                    "content": self.system_prompt
                }
            ]

            # Add conversation history
            if history:
                messages.extend(history)

            # Add current context and question
            user_context = f"""Current {self.domain_name} Status:
{domain_data}

User Question: {user_message}"""

            messages.append({
                "role": "user",
                "content": user_context
            })

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

    async def _handle_control_intent(self, user_message: str) -> Dict[str, Any]:
        """
        Handle control intents by executing actions and verifying results

        This directly executes the control action without going through OpenAI.
        """
        try:
            # Find matching entities
            entities_result = await self.ha_client.get_entities()
            if not entities_result.get("success"):
                return {
                    "success": False,
                    "error": "Could not fetch entities from Home Assistant",
                    "tokens_used": 0,
                }

            all_entities = entities_result.get("data", [])
            domain_entities = [
                e for e in all_entities
                if e.get("entity_id", "").startswith(f"{self.domain}.")
            ]

            # Find best matches
            matches = self._find_matching_entities(user_message, domain_entities)
            if not matches:
                return {
                    "success": True,
                    "response": f"No {self.domain_name} found matching '{user_message}'",
                    "tokens_used": 0,
                    "metadata": {"agent": f"{self.domain_name.title()} Agent", "intent": "control"}
                }

            # Determine action from message
            action = self._determine_control_action(user_message)

            # Execute action on each matching entity
            results = []
            for entity in matches:
                entity_id = entity.get("entity_id")
                name = entity.get("attributes", {}).get("friendly_name", entity_id)

                # Execute the action
                action_result = await self._execute_control_action(action, entity_id)

                # Build result message
                if action_result.get("verification", {}).get("success"):
                    results.append(f"✓ {action.title()} {name}")
                else:
                    results.append(f"✗ Failed to {action} {name} - still {action_result.get('verification', {}).get('actual_state', 'unchanged')}")

            # Build response
            response_text = f"**{action.title()} {self.domain_name}:**\n" + "\n".join(results)

            return {
                "success": True,
                "response": response_text,
                "tokens_used": 0,
                "metadata": {
                    "agent": f"{self.domain_name.title()} Agent",
                    "intent": "control",
                    "actions_executed": len(matches),
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error executing control action: {str(e)}",
                "tokens_used": 0,
            }

    def _determine_control_action(self, user_message: str) -> str:
        """Determine the control action from user message"""
        message_lower = user_message.lower()

        if any(word in message_lower for word in ["turn on", "on", "enable", "set on"]):
            return "on"
        elif any(word in message_lower for word in ["turn off", "off", "disable", "set off"]):
            return "off"
        elif any(word in message_lower for word in ["toggle", "switch"]):
            return "toggle"
        else:
            return "off"  # Default to off for ambiguous requests

    async def _execute_control_action(self, action: str, entity_id: str) -> Dict[str, Any]:
        """Execute a control action on an entity and verify state change."""
        import asyncio

        try:
            # Call the action
            if action == "on":
                result = await self.ha_client.turn_on_entity(entity_id)
                expected_state = "on"
            elif action == "off":
                result = await self.ha_client.turn_off_entity(entity_id)
                expected_state = "off"
            elif action == "toggle":
                result = await self.ha_client.toggle_entity(entity_id)
                expected_state = None  # Don't verify for toggle, just check it changed
            else:
                return {"success": False, "error": f"Unknown action: {action}"}

            # Wait briefly for HA to update state (avoids race condition)
            await asyncio.sleep(0.5)

            # Verify the state changed (retry once if it fails)
            state_result = await self.ha_client.get_entity_state(entity_id)

            if state_result.get("success"):
                actual_state = state_result.get("data", {}).get("state", "unknown")

                # If verification failed and we expected success, retry once
                if expected_state and actual_state != expected_state:
                    await asyncio.sleep(0.5)
                    state_result = await self.ha_client.get_entity_state(entity_id)
                    if state_result.get("success"):
                        actual_state = state_result.get("data", {}).get("state", "unknown")

                if expected_state:
                    # For on/off, check if state matches
                    result["verification"] = {
                        "verified": True,
                        "expected_state": expected_state,
                        "actual_state": actual_state,
                        "success": actual_state == expected_state
                    }
                else:
                    # For toggle, just confirm we got a state
                    result["verification"] = {
                        "verified": True,
                        "actual_state": actual_state,
                        "success": actual_state in ["on", "off"]
                    }
            else:
                # Couldn't verify
                result["verification"] = {
                    "verified": False,
                    "error": "Could not verify state after action"
                }

            return result

        except Exception as e:
            return {
                "success": False,
                "error": f"Error executing action: {str(e)}",
                "verification": {"verified": False, "error": str(e)}
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

        STRICT MATCHING to avoid over-matching:
        - Filters out generic/control words
        - Requires meaningful keyword matches (not just domain name)
        - Returns only top 3 matches max to prevent controlling entire house

        Example: "basement desk" matches "light.basement_desk_light1"
        """
        if not entities:
            return []

        # Filter out generic/control words that appear in everything
        generic_words = {
            "turn", "on", "off", "toggle", "switch",
            "set", "change", "adjust", "dim", "brighten",
            "the", "a", "an", "and", "or", "is", "are", "to", "at",
            "can", "you", "please", "thank", "thanks"
        }

        query_words = [w for w in user_query.lower().split() if w not in generic_words]

        # If no meaningful words left, can't match reliably
        if not query_words:
            return []

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
            matched_words = 0
            for word in query_words:
                if word in entity_parts or word in name_parts:
                    score += 3  # Exact word match
                    matched_words += 1
                # Partial matches (word appears within a part)
                elif any(word in part for part in entity_parts + name_parts):
                    score += 1

            # Require at least one meaningful word match (not just domain)
            if matched_words > 0:
                matches.append((score, entity))

        # Sort by relevance and return only top 3 matches
        # This prevents "turn off light" from affecting the entire house
        sorted_matches = sorted(matches, key=lambda x: x[0], reverse=True)
        top_matches = [entity for score, entity in sorted_matches[:3]]

        return top_matches

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
