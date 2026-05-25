"""
SystemAgent - High-level visibility into Home Assistant system
Queries entities, automations, integrations, and metrics
"""

import json
from typing import Dict, Any, Optional
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
        return """You are FirstFire's System Agent - the high-level overseer of a Home Assistant installation.

Your role is to:
1. Help users understand their Home Assistant system at a glance
2. Explain entities (devices, automations, integrations)
3. Identify gaps, redundancies, or optimization opportunities
4. Provide setup guidance and best practices
5. Answer questions about system state and capabilities

Always respond in Markdown format for clarity. Use headers, lists, and formatting to make information scannable.

Key principles:
- Be concise but thorough
- Group related information
- Highlight important details with emphasis (*bold*, `code`)
- Use lists and tables when showing multiple items
- Suggest improvements when you see opportunities"""

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process message using Claude with HA API tools

        Args:
            user_message: User's question about the system

        Returns:
            Dict with response, token count, and metadata
        """
        try:
            # Gather system context
            system_context = await self._gather_system_context()

            # Prepare tools for Claude to call HA
            tools = self._get_tools()

            # Initial message with context
            messages = [
                {
                    "role": "user",
                    "content": f"""System Context:
{system_context}

User Question: {user_message}"""
                }
            ]

            # Call Claude with tool use
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=self.system_prompt,
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )

            # Process response
            tokens_used = response.usage.total_tokens if response.usage else 0

            # Handle tool calls if present
            final_response = await self._process_response(response, messages)

            return {
                "success": True,
                "response": final_response,
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
        """Gather current system state for context"""
        context_parts = []

        # System info
        sys_info = await self.ha_client.get_system_info()
        if sys_info.get("success"):
            info = sys_info.get("data", {})
            context_parts.append(f"**Version:** {info.get('version', 'Unknown')}")
            context_parts.append(f"**Unit Name:** {info.get('unit_name', 'Unknown')}")

        # Entity count
        entities = await self.ha_client.get_entities()
        if entities.get("success"):
            entity_list = entities.get("data", [])
            entity_counts = self._count_entity_types(entity_list)
            context_parts.append(f"**Total Entities:** {len(entity_list)}")
            for etype, count in entity_counts.items():
                context_parts.append(f"  - {etype}: {count}")

        # Automation count
        automations = await self.ha_client.get_automations()
        if automations.get("success"):
            auto_list = automations.get("data", [])
            context_parts.append(f"**Automations:** {len(auto_list)}")

        # Integration count
        integrations = await self.ha_client.get_integrations()
        if integrations.get("success"):
            int_list = integrations.get("data", [])
            context_parts.append(f"**Integrations:** {len(int_list)}")

        return "\n".join(context_parts) if context_parts else "System context unavailable"

    def _count_entity_types(self, entities: list) -> Dict[str, int]:
        """Count entities by type"""
        counts = {}
        for entity in entities:
            etype = entity.get("entity_id", "").split(".")[0]
            counts[etype] = counts.get(etype, 0) + 1
        return dict(sorted(counts.items()))

    def _get_tools(self) -> list:
        """Define tools Claude can use to query HA"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_entities",
                    "description": "Get all Home Assistant entities (lights, switches, sensors, etc.)",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_automations",
                    "description": "Get all Home Assistant automations",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_integrations",
                    "description": "Get installed Home Assistant integrations",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_entity_state",
                    "description": "Get current state of a specific entity",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "entity_id": {
                                "type": "string",
                                "description": "Entity ID (e.g., 'light.living_room')"
                            }
                        },
                        "required": ["entity_id"]
                    }
                }
            }
        ]

    async def _process_response(
        self, response: Any, messages: list
    ) -> str:
        """Process Claude response, handling tool calls if needed"""
        if response.choices[0].finish_reason == "tool_calls":
            # Handle tool calls
            tool_calls = response.choices[0].message.tool_calls
            tool_results = []

            for tool_call in tool_calls:
                result = await self._handle_tool_call(
                    tool_call.function.name,
                    json.loads(tool_call.function.arguments)
                )
                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "result": result
                })

            # Continue conversation with tool results
            messages.append({
                "role": "assistant",
                "content": response.choices[0].message.content or ""
            })

            for tool_result in tool_results:
                messages.append({
                    "role": "user",
                    "content": f"Tool result: {tool_result['result']}"
                })

            # Get final response
            final_response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=self.system_prompt,
                messages=messages
            )

            return final_response.choices[0].message.content or "No response"
        else:
            # Direct response
            return response.choices[0].message.content or "No response"

    async def _handle_tool_call(self, tool_name: str, args: Dict) -> str:
        """Handle Claude's tool calls to HA API"""
        try:
            if tool_name == "get_entities":
                result = await self.ha_client.get_entities()
            elif tool_name == "get_automations":
                result = await self.ha_client.get_automations()
            elif tool_name == "get_integrations":
                result = await self.ha_client.get_integrations()
            elif tool_name == "get_entity_state":
                result = await self.ha_client.get_entity_state(args.get("entity_id", ""))
            else:
                result = {"success": False, "error": f"Unknown tool: {tool_name}"}

            return json.dumps(result)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
