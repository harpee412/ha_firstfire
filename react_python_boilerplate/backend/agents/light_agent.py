"""
Light Agent - Specializes in light entity management and control
"""

from typing import List, Dict, Any
from .domain_agent import DomainAgent


class LightAgent(DomainAgent):
    """
    Agent for managing and controlling lights in Home Assistant

    Capabilities:
    - Query light status, brightness, color
    - Control lights: turn on/off, adjust brightness, set color
    - Suggest lighting automations
    - Explain light capabilities and features
    - Help with scenes and groups
    """

    def __init__(self):
        super().__init__(domain="light")

    def _build_system_prompt(self) -> str:
        """Override with light-specific guidance"""
        return """You are FirstFire's Light Agent - specializing in smart lighting.

Your expertise includes:
1. Smart light status, brightness (0-255), color temperature, RGB colors
2. Controlling lights: turn on/off, dim, brighten, change colors
3. Light groups, scenes, and automation
4. Energy efficiency and lighting automation recommendations
5. Troubleshooting light connectivity issues
6. Explaining features like color modes, brightness transitions, effects

You can take action on lights:
- "Turn on the living room light" → Execute turn_on
- "Dim bedroom to 50%" → Set brightness to ~128
- "Turn off all lights" → Turn off each light mentioned
- Always confirm what you're doing first if it's a control action

Always respond in Markdown format. When discussing:
- Multiple lights: show as a list grouped by room or status
- Specific light: show current state, brightness (0-255), color info
- Control actions: confirm what you'll do, then report success/failure
- Automations: suggest practical lighting scenarios (morning wake-up, evening dimming, away mode)
- Technical details: use code blocks for state values and service calls

Be friendly and practical. Focus on what lights are actually capable of."""

    def _format_control(self, entities: List[Dict]) -> str:
        """Override to show light-specific details"""
        output = ["**Available Lights:**"]

        for entity in entities[:15]:  # Show more for lights since they're common
            attrs = entity.get("attributes", {})
            name = attrs.get("friendly_name", entity.get("entity_id"))
            state = entity.get("state")

            output.append(f"\n- **{name}**")
            output.append(f"  State: `{state}`")

            if state == "on":
                brightness = attrs.get("brightness")
                if brightness:
                    pct = int((brightness / 255) * 100)
                    output.append(f"  Brightness: {pct}%")

                color_mode = attrs.get("color_mode")
                if color_mode:
                    output.append(f"  Color Mode: `{color_mode}`")

                color_temp = attrs.get("color_temp_kelvin")
                if color_temp:
                    output.append(f"  Color Temp: {color_temp}K")

                rgb = attrs.get("rgb_color")
                if rgb:
                    output.append(f"  RGB: {rgb}")

        if len(entities) > 15:
            output.append(f"\n... and {len(entities) - 15} more lights")

        return "\n".join(output)

    def _format_summary(self, entities: List[Dict]) -> str:
        """Override for light-specific summary"""
        on_count = sum(1 for e in entities if e.get("state") == "on")
        off_count = len(entities) - on_count

        output = [
            "**Lighting Summary:**",
            f"- Total lights: {len(entities)}",
            f"- On: {on_count}",
            f"- Off: {off_count}",
        ]

        # Show rooms if available
        by_room = {}
        for entity in entities:
            name = entity.get("attributes", {}).get("friendly_name", entity.get("entity_id"))
            # Try to extract room from friendly name (e.g., "Living Room Light" -> "Living Room")
            room = " ".join(name.split()[:-1]) if len(name.split()) > 1 else "Other"
            if room not in by_room:
                by_room[room] = []
            by_room[room].append(name)

        if len(by_room) > 1:
            output.append("\n**By Room:**")
            for room, lights in sorted(by_room.items()):
                output.append(f"- {room}: {len(lights)} lights")

        return "\n".join(output)

    # =========================================================================
    # Light Control Actions
    # =========================================================================

    async def turn_on(self, entity_id: str, brightness: int = None) -> Dict[str, Any]:
        """Turn on a light with optional brightness (0-255 or percentage)"""
        # If brightness is a percentage (0-100), convert to 0-255
        if brightness and brightness <= 100:
            brightness = int((brightness / 100) * 255)

        return await self.ha_client.turn_on_light(entity_id, brightness=brightness)

    async def turn_off(self, entity_id: str) -> Dict[str, Any]:
        """Turn off a light"""
        return await self.ha_client.turn_off_light(entity_id)

    async def toggle(self, entity_id: str) -> Dict[str, Any]:
        """Toggle a light on/off"""
        return await self.ha_client.toggle_light(entity_id)

    async def set_brightness(self, entity_id: str, brightness: int) -> Dict[str, Any]:
        """Set brightness (accepts 0-100 percentage or 0-255 value)"""
        if brightness <= 100:
            brightness = int((brightness / 100) * 255)
        return await self.ha_client.set_light_brightness(entity_id, brightness)
