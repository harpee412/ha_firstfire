"""
Analytics Agent - Provides historical analysis and patterns from InfluxDB
"""

from typing import Dict, Any
from ..influxdb_client import get_influxdb_client
from .base import BaseAgent


class AnalyticsAgent(BaseAgent):
    """
    Agent for historical data analysis and time-series insights

    Capabilities:
    - Query historical entity data
    - Generate statistics and trends
    - Detect usage patterns
    - Provide energy insights
    - Identify anomalies
    """

    def __init__(self):
        super().__init__(
            name="AnalyticsAgent",
            description="Provides historical analysis and patterns from InfluxDB time-series data"
        )
        self.influxdb = get_influxdb_client()

    def _build_system_prompt(self) -> str:
        """Build system prompt for analytics agent"""
        return """You are FirstFire's Analytics Agent - analyzing historical home data.

Your expertise:
1. Historical trends and patterns
2. Energy consumption analysis
3. Device usage statistics
4. Anomaly detection
5. Automation recommendations based on patterns

You have access to time-series data from InfluxDB. Provide insights about:
- When devices are typically used
- Trends over time
- Energy usage patterns
- Unusual or anomalous behavior
- Data-driven automation suggestions

Format responses clearly with data visualizations when helpful (ASCII charts, tables).
Be concise and focus on actionable insights."""

    async def process_message(self, user_message: str, history: list = None) -> Dict[str, Any]:
        """
        Process analytics queries

        Args:
            user_message: User's question about historical data
            history: Conversation history

        Returns:
            Dict with analysis results
        """
        if not self.influxdb or not self.influxdb.is_connected():
            return {
                "success": False,
                "error": "InfluxDB is not connected. Configure InfluxDB credentials to enable analytics.",
                "tokens_used": 0,
            }

        try:
            # Parse the user message to determine what kind of analysis to perform
            message_lower = user_message.lower()

            if any(word in message_lower for word in ["history", "trend", "pattern", "over time"]):
                return await self._analyze_trends(user_message)
            elif any(word in message_lower for word in ["energy", "power", "consumption", "usage"]):
                return await self._analyze_energy(user_message)
            elif any(word in message_lower for word in ["stats", "statistic", "average", "min", "max"]):
                return await self._get_statistics(user_message)
            elif any(word in message_lower for word in ["anomal", "unusual", "strange", "not normal"]):
                return await self._detect_anomalies(user_message)
            else:
                return await self._general_analysis(user_message)

        except Exception as e:
            return {
                "success": False,
                "error": f"Analytics error: {str(e)}",
                "tokens_used": 0,
            }

    async def _analyze_trends(self, user_message: str) -> Dict[str, Any]:
        """Analyze usage trends"""
        # Extract entity name from message
        entity_id = self._extract_entity_id(user_message)

        if not entity_id:
            return {
                "success": True,
                "response": "Please specify which device you'd like to analyze (e.g., 'Show trend for living room lights')",
                "tokens_used": 0,
            }

        result = await self.influxdb.detect_patterns(entity_id, hours=168)

        if result.get("success"):
            response = f"""**Trend Analysis: {entity_id}**

State changes (last 7 days): {result.get('state_changes', 0)}

Recent changes:
"""
            for change in result.get("recent_changes", [])[:5]:
                response += f"\n- {change['from']} → {change['to']} at {change['timestamp']}"

            return {
                "success": True,
                "response": response,
                "tokens_used": 0,
                "metadata": {"agent": "AnalyticsAgent", "analysis_type": "trends"}
            }
        else:
            return {
                "success": False,
                "error": result.get("error"),
                "tokens_used": 0,
            }

    async def _analyze_energy(self, user_message: str) -> Dict[str, Any]:
        """Analyze energy consumption"""
        return {
            "success": True,
            "response": "**Energy Analysis** - Detailed power consumption analysis coming soon. This will show usage patterns, peak times, and optimization suggestions.",
            "tokens_used": 0,
            "metadata": {"agent": "AnalyticsAgent", "analysis_type": "energy"}
        }

    async def _get_statistics(self, user_message: str) -> Dict[str, Any]:
        """Get statistics for an entity"""
        entity_id = self._extract_entity_id(user_message)

        if not entity_id:
            return {
                "success": True,
                "response": "Please specify which device (e.g., 'Statistics for bedroom temperature')",
                "tokens_used": 0,
            }

        result = await self.influxdb.get_entity_stats(entity_id, hours=24)

        if result.get("success"):
            stats = result.get("stats", {})
            response = f"""**Statistics: {entity_id}** (last 24 hours)

"""
            for stat_name, stat_value in stats.items():
                response += f"- {stat_name}: {stat_value}\n"

            return {
                "success": True,
                "response": response,
                "tokens_used": 0,
                "metadata": {"agent": "AnalyticsAgent", "analysis_type": "statistics"}
            }
        else:
            return {
                "success": False,
                "error": result.get("error"),
                "tokens_used": 0,
            }

    async def _detect_anomalies(self, user_message: str) -> Dict[str, Any]:
        """Detect anomalies in data"""
        return {
            "success": True,
            "response": "**Anomaly Detection** - Advanced anomaly detection coming soon. This will identify unusual patterns and alert you to potential issues.",
            "tokens_used": 0,
            "metadata": {"agent": "AnalyticsAgent", "analysis_type": "anomalies"}
        }

    async def _general_analysis(self, user_message: str) -> Dict[str, Any]:
        """General analytics response"""
        return {
            "success": True,
            "response": """**Analytics Ready**

I can analyze your home data with:
- **Trends**: Usage patterns over time
- **Energy**: Power consumption analysis
- **Stats**: Min/max/average values
- **Anomalies**: Unusual patterns and alerts
- **Patterns**: Device usage routines

Ask about any specific device or time period to get started!""",
            "tokens_used": 0,
            "metadata": {"agent": "AnalyticsAgent", "analysis_type": "general"}
        }

    @staticmethod
    def _extract_entity_id(message: str) -> str:
        """Try to extract entity ID from user message"""
        # Simple heuristic: look for domain.name pattern or common device names
        message_lower = message.lower()

        # Common patterns
        domains = ["light", "switch", "sensor", "binary_sensor", "climate"]
        locations = ["living room", "bedroom", "kitchen", "basement", "garage", "office"]

        for location in locations:
            if location in message_lower:
                # Try to find a domain
                for domain in domains:
                    if domain in message_lower:
                        # Rough entity ID construction
                        location_slug = location.replace(" ", "_")
                        return f"{domain}.{location_slug}"

        return ""
