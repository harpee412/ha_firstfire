"""
Home Assistant API Client
Direct integration with Home Assistant via supervisor API gateway
"""

import os
import json
from typing import Optional, Dict, List, Any
import httpx
from pathlib import Path


class HomeAssistantClient:
    """Client for Home Assistant API calls via supervisor"""

    def __init__(self):
        """Initialize HA client with supervisor token and gateway"""
        self.supervisor_token = os.getenv("SUPERVISOR_TOKEN")
        # Use supervisor API gateway to reach Home Assistant Core
        self.ha_url = "http://supervisor/core/api"
        self.timeout = 10

        if not self.supervisor_token:
            print("Warning: SUPERVISOR_TOKEN not set. HA API calls will fail.")

    async def get_entities(self) -> Dict[str, Any]:
        """Fetch all entities from Home Assistant"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {self.supervisor_token}"}
                response = await client.get(
                    f"{self.ha_url}/states",
                    headers=headers
                )
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_automations(self) -> Dict[str, Any]:
        """Fetch automations from Home Assistant (parsed from states)"""
        try:
            # Automations are exposed as automation.* entities in /api/states
            entities_result = await self.get_entities()
            if entities_result.get("success"):
                all_entities = entities_result.get("data", [])
                automations = [e for e in all_entities if e.get("entity_id", "").startswith("automation.")]
                return {"success": True, "data": automations}
            return entities_result
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_integrations(self) -> Dict[str, Any]:
        """Fetch installed integrations from Home Assistant config"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {self.supervisor_token}"}
                response = await client.get(
                    f"{self.ha_url}/config",
                    headers=headers
                )
                if response.status_code == 200:
                    config = response.json()
                    # Extract integrations from config components
                    integrations = config.get("components", [])
                    return {"success": True, "data": integrations}
                return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_system_info(self) -> Dict[str, Any]:
        """Fetch system information from Home Assistant"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {self.supervisor_token}"}
                response = await client.get(
                    f"{self.ha_url}/config",
                    headers=headers
                )
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def call_service(
        self, domain: str, service: str, service_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Call a Home Assistant service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {self.supervisor_token}"}
                response = await client.post(
                    f"{self.ha_url}/services/{domain}/{service}",
                    headers=headers,
                    json=service_data or {}
                )
                if response.status_code in [200, 201]:
                    return {"success": True, "data": response.json()}
                return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_entity_state(self, entity_id: str) -> Dict[str, Any]:
        """Get state of a specific entity"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {self.supervisor_token}"}
                response = await client.get(
                    f"{self.ha_url}/states/{entity_id}",
                    headers=headers
                )
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                return {"success": False, "error": f"Status {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # =========================================================================
    # Light Control Methods
    # =========================================================================

    async def turn_on_light(self, entity_id: str, brightness: Optional[int] = None, **kwargs) -> Dict[str, Any]:
        """Turn on a light with optional brightness (0-255)"""
        service_data = {"entity_id": entity_id}
        if brightness is not None:
            service_data["brightness"] = max(0, min(255, brightness))
        service_data.update(kwargs)
        return await self.call_service("light", "turn_on", service_data)

    async def turn_off_light(self, entity_id: str) -> Dict[str, Any]:
        """Turn off a light"""
        return await self.call_service("light", "turn_off", {"entity_id": entity_id})

    async def toggle_light(self, entity_id: str) -> Dict[str, Any]:
        """Toggle a light on/off"""
        return await self.call_service("light", "toggle", {"entity_id": entity_id})

    async def set_light_brightness(self, entity_id: str, brightness: int) -> Dict[str, Any]:
        """Set light brightness (0-255)"""
        return await self.turn_on_light(entity_id, brightness=brightness)

    # =========================================================================
    # Switch Control Methods
    # =========================================================================

    async def turn_on_switch(self, entity_id: str) -> Dict[str, Any]:
        """Turn on a switch"""
        return await self.call_service("switch", "turn_on", {"entity_id": entity_id})

    async def turn_off_switch(self, entity_id: str) -> Dict[str, Any]:
        """Turn off a switch"""
        return await self.call_service("switch", "turn_off", {"entity_id": entity_id})

    async def toggle_switch(self, entity_id: str) -> Dict[str, Any]:
        """Toggle a switch"""
        return await self.call_service("switch", "toggle", {"entity_id": entity_id})

    # =========================================================================
    # Generic Control Methods
    # =========================================================================

    async def turn_on_entity(self, entity_id: str, **kwargs) -> Dict[str, Any]:
        """Generic turn on for any domain"""
        domain = entity_id.split(".")[0]
        service_data = {"entity_id": entity_id}
        service_data.update(kwargs)
        return await self.call_service(domain, "turn_on", service_data)

    async def turn_off_entity(self, entity_id: str) -> Dict[str, Any]:
        """Generic turn off for any domain"""
        domain = entity_id.split(".")[0]
        return await self.call_service(domain, "turn_off", {"entity_id": entity_id})

    async def toggle_entity(self, entity_id: str) -> Dict[str, Any]:
        """Generic toggle for any domain"""
        domain = entity_id.split(".")[0]
        return await self.call_service(domain, "toggle", {"entity_id": entity_id})
