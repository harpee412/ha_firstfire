"""
InfluxDB Client - Access historical time-series data from Home Assistant
Supports both InfluxDB 1.x (username/password) and 2.x (token-based) authentication
"""

import os
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import json

# Try to import InfluxDB 2.x client first, fall back to 1.x
try:
    from influxdb_client import InfluxDBClient as InfluxDB2Client
    from influxdb_client.client.query_api import QueryApi
    INFLUXDB_2_AVAILABLE = True
except ImportError:
    INFLUXDB_2_AVAILABLE = False

try:
    from influxdb import InfluxDBClient as InfluxDB1Client
    INFLUXDB_1_AVAILABLE = True
except ImportError:
    INFLUXDB_1_AVAILABLE = False

INFLUXDB_AVAILABLE = INFLUXDB_2_AVAILABLE or INFLUXDB_1_AVAILABLE


class InfluxDBConnector:
    """Connect to and query InfluxDB for time-series data

    Supports:
    - InfluxDB 2.x with token authentication
    - InfluxDB 1.x with username/password authentication
    """

    def __init__(self, url: str, token_or_password: str, org_or_database: str = None,
                 bucket: str = None, username: str = None, use_v1: bool = False):
        """
        Initialize InfluxDB connection

        Args:
            url: InfluxDB URL (e.g., "http://influxdb:8086")
            token_or_password: API token (v2) or password (v1)
            org_or_database: Organization (v2) or database name (v1)
            bucket: Bucket name (v2 only, typically "home_assistant")
            username: Username for v1 authentication
            use_v1: Force use of InfluxDB 1.x
        """
        self.url = url
        self.bucket = bucket or "home_assistant"
        self.client = None
        self.query_api = None
        self.is_v1 = use_v1

        if not INFLUXDB_AVAILABLE:
            print("InfluxDB client not available")
            return

        try:
            # Try InfluxDB 1.x if username provided or v1 forced
            if (username and token_or_password) or (use_v1 and INFLUXDB_1_AVAILABLE):
                if INFLUXDB_1_AVAILABLE:
                    print(f"Connecting to InfluxDB 1.x at {url}")
                    self.client = InfluxDB1Client(
                        host=url.replace("http://", "").replace("https://", "").split(":")[0],
                        port=int(url.split(":")[-1]) if ":" in url else 8086,
                        username=username or "admin",
                        password=token_or_password,
                        database=org_or_database or "homeassistant",
                    )
                    self.is_v1 = True
                    self._test_connection()
                    return

            # Fall back to InfluxDB 2.x
            if INFLUXDB_2_AVAILABLE:
                print(f"Connecting to InfluxDB 2.x at {url}")
                self.client = InfluxDB2Client(
                    url=url,
                    token=token_or_password,
                    org=org_or_database or "home-assistant"
                )
                self.query_api = self.client.query_api()
                self.is_v1 = False
                self._test_connection()

        except Exception as e:
            print(f"Failed to connect to InfluxDB: {e}")
            self.client = None
            self.query_api = None

    def _test_connection(self) -> bool:
        """Test if connection is working"""
        try:
            if not self.client:
                return False

            if self.is_v1:
                # For InfluxDB 1.x, try to ping or query databases
                try:
                    self.client.ping()
                    return True
                except AttributeError:
                    # If ping() doesn't exist, try to get server info
                    try:
                        self.client.request('GET', 'ping')
                        return True
                    except:
                        # Last resort: try to list databases
                        self.client.get_list_database()
                        return True
            else:
                # For InfluxDB 2.x, use ready()
                self.client.ready()
                return True
        except Exception as e:
            print(f"InfluxDB connection test failed: {e}")
        return False

    def is_connected(self) -> bool:
        """Check if InfluxDB is connected and ready"""
        return self.client is not None and self._test_connection()

    async def query_entity_history(
        self,
        entity_id: str,
        hours: int = 24,
        aggregate: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Query historical data for an entity

        Args:
            entity_id: Entity ID (e.g., "light.living_room")
            hours: Hours to look back
            aggregate: Optional aggregation (mean, max, min, last)

        Returns:
            Dict with timestamps and values
        """
        if not self.is_connected() or not self.query_api:
            return {"success": False, "error": "InfluxDB not connected"}

        try:
            # Convert entity_id to measurement name (home_assistant.light.living_room -> light.living_room)
            domain, name = entity_id.split(".", 1)

            # Build Flux query
            query = f"""
            from(bucket: "{self.bucket}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r["entity_id"] == "{entity_id}")
            |> filter(fn: (r) => r["_field"] == "value" or r["_field"] == "state")
            """

            if aggregate:
                query += f"""
            |> aggregateWindow(every: 1h, fn: {aggregate}, createEmpty: false)
            """

            query += "|> sort(columns: [\"_time\"], desc: true)"

            result = self.query_api.query(query)

            # Parse results
            data_points = []
            for table in result:
                for record in table.records:
                    data_points.append({
                        "timestamp": record.get_time().isoformat(),
                        "value": record.get_value(),
                    })

            return {
                "success": True,
                "entity_id": entity_id,
                "data": data_points,
                "hours_back": hours,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Query failed: {str(e)}",
            }

    async def get_entity_stats(
        self,
        entity_id: str,
        hours: int = 24,
    ) -> Dict[str, Any]:
        """
        Get statistics for an entity (min, max, mean, etc.)

        Args:
            entity_id: Entity ID
            hours: Hours to look back

        Returns:
            Dict with statistics
        """
        if not self.is_connected() or not self.query_api:
            return {"success": False, "error": "InfluxDB not connected"}

        try:
            query = f"""
            from(bucket: "{self.bucket}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r["entity_id"] == "{entity_id}")
            |> filter(fn: (r) => r["_field"] == "value" or r["_field"] == "state")
            |> stats()
            """

            result = self.query_api.query(query)

            stats = {}
            for table in result:
                for record in table.records:
                    field_name = record.get_field()
                    stats[field_name] = record.get_value()

            return {
                "success": True,
                "entity_id": entity_id,
                "stats": stats,
                "hours_back": hours,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Stats query failed: {str(e)}",
            }

    async def detect_patterns(
        self,
        entity_id: str,
        hours: int = 168,  # 1 week
    ) -> Dict[str, Any]:
        """
        Detect usage patterns for an entity

        Args:
            entity_id: Entity ID
            hours: Hours to analyze

        Returns:
            Dict with pattern analysis
        """
        if not self.is_connected() or not self.query_api:
            return {"success": False, "error": "InfluxDB not connected"}

        try:
            query = f"""
            from(bucket: "{self.bucket}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r["entity_id"] == "{entity_id}")
            |> filter(fn: (r) => r["_field"] == "value" or r["_field"] == "state")
            """

            result = self.query_api.query(query)

            # Analyze state changes and timing
            state_changes = []
            last_state = None
            last_time = None

            for table in result:
                for record in table.records:
                    current_state = record.get_value()
                    current_time = record.get_time()

                    if current_state != last_state and last_state is not None:
                        state_changes.append({
                            "from": last_state,
                            "to": current_state,
                            "timestamp": current_time.isoformat(),
                        })

                    last_state = current_state
                    last_time = current_time

            return {
                "success": True,
                "entity_id": entity_id,
                "state_changes": len(state_changes),
                "recent_changes": state_changes[:10],  # Last 10 changes
                "analysis_hours": hours,
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Pattern detection failed: {str(e)}",
            }

    def close(self):
        """Close the InfluxDB connection"""
        if self.client:
            self.client.close()

    def __del__(self):
        """Cleanup on deletion"""
        self.close()


# Global instance (will be initialized from config)
_influxdb_instance: Optional[InfluxDBConnector] = None


def get_influxdb_client() -> Optional[InfluxDBConnector]:
    """Get the global InfluxDB client instance"""
    return _influxdb_instance


def set_influxdb_client(client: Optional[InfluxDBConnector]):
    """Set the global InfluxDB client instance"""
    global _influxdb_instance
    _influxdb_instance = client


def init_influxdb(url: str, token_or_password: str, org_or_database: str = None,
                   bucket: str = None, username: str = None, use_v1: bool = False) -> InfluxDBConnector:
    """
    Initialize InfluxDB connection (supports v1.x and v2.x)

    Args:
        url: InfluxDB URL
        token_or_password: API token (v2) or password (v1)
        org_or_database: Organization (v2) or database name (v1)
        bucket: Bucket name (v2 only)
        username: Username (v1 only)
        use_v1: Force use of InfluxDB 1.x

    Returns:
        InfluxDBConnector instance
    """
    client = InfluxDBConnector(
        url=url,
        token_or_password=token_or_password,
        org_or_database=org_or_database,
        bucket=bucket,
        username=username,
        use_v1=use_v1
    )
    set_influxdb_client(client)
    return client
