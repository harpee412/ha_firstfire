"""
Switch Agent - Specializes in switch entity management
"""

from typing import List, Dict, Any
from .domain_agent import DomainAgent


class SwitchAgent(DomainAgent):
    """
    Agent for managing switches in Home Assistant

    Capabilities:
    - Query switch status and history
    - Suggest switch automation patterns
    - Help with relay control and smart plugs
    - Troubleshoot switch connectivity
    """

    def __init__(self):
        super().__init__(domain="switch")

    def _build_system_prompt(self) -> str:
        """Override with switch-specific guidance"""
        return """You are FirstFire's Switch Agent - specializing in smart switches and relays.

Your expertise includes:
1. Smart switch status and control (on/off)
2. Smart plugs, relays, and outlet control
3. Switch automation for schedules and conditions
4. Energy monitoring for smart plugs
5. Troubleshooting connection and control issues

You have access to current switch entity data from Home Assistant.

Always respond in Markdown format. When discussing:
- Multiple switches: group by type (smart plugs, wall switches, relays) or location
- Specific switch: show current state, power draw if available, associated automations
- Automations: suggest practical patterns (time-based on/off, condition-triggered control, scenes)
- Power monitoring: highlight high-consumption devices

Be practical and helpful. Focus on reliability and safety of electrical control."""

    def _format_control(self, entities: List[Dict]) -> str:
        """Override to show switch-specific details"""
        output = ["**Available Switches:**"]

        for entity in entities[:15]:
            attrs = entity.get("attributes", {})
            name = attrs.get("friendly_name", entity.get("entity_id"))
            state = entity.get("state")

            output.append(f"\n- **{name}**")
            output.append(f"  State: `{state}`")

            # Power draw if available
            power = attrs.get("current_power_w")
            if power:
                output.append(f"  Power: {power}W")

            # Voltage if available
            voltage = attrs.get("voltage")
            if voltage:
                output.append(f"  Voltage: {voltage}V")

            # Device class if available
            device_class = attrs.get("device_class")
            if device_class:
                output.append(f"  Type: {device_class}")

        if len(entities) > 15:
            output.append(f"\n... and {len(entities) - 15} more switches")

        return "\n".join(output)

    def _format_summary(self, entities: List[Dict]) -> str:
        """Override for switch-specific summary"""
        on_count = sum(1 for e in entities if e.get("state") == "on")
        off_count = len(entities) - on_count

        output = [
            "**Switch Summary:**",
            f"- Total switches: {len(entities)}",
            f"- On: {on_count}",
            f"- Off: {off_count}",
        ]

        # Calculate total power if available
        total_power = 0
        has_power = False
        for entity in entities:
            power = entity.get("attributes", {}).get("current_power_w")
            if power and entity.get("state") == "on":
                total_power += power
                has_power = True

        if has_power:
            output.append(f"\n**Current Power Draw:** {total_power:.1f}W")

        # Group by type
        by_type = {}
        for entity in entities:
            device_class = entity.get("attributes", {}).get("device_class", "generic")
            if device_class not in by_type:
                by_type[device_class] = 0
            by_type[device_class] += 1

        if len(by_type) > 1:
            output.append("\n**By Type:**")
            for switch_type, count in sorted(by_type.items()):
                output.append(f"- {switch_type.replace('_', ' ').title()}: {count}")

        return "\n".join(output)
