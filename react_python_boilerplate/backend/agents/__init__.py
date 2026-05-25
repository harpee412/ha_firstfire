"""
Agent system for FirstFire

Multi-agent architecture:
- SystemAgent: High-level system overview and general queries
- LightAgent: Lighting control and status
- SwitchAgent: Switches, relays, and smart plugs
- AutomationAgent: Automation creation and management
- AgentRouter: Intelligently routes user messages to appropriate agent
"""

from .base import BaseAgent
from .domain_agent import DomainAgent
from .system_agent import SystemAgent
from .light_agent import LightAgent
from .switch_agent import SwitchAgent
from .automation_agent import AutomationAgent
from .agent_router import AgentRouter

__all__ = [
    "BaseAgent",
    "DomainAgent",
    "SystemAgent",
    "LightAgent",
    "SwitchAgent",
    "AutomationAgent",
    "AgentRouter",
]
