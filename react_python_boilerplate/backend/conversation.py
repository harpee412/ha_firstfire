"""
Conversation management - Maintains chat history per conversation
"""

import uuid
from typing import Dict, List, Any
from datetime import datetime, timedelta


class ConversationManager:
    """
    Manages multi-turn conversations with automatic cleanup

    Stores conversation history so agents can maintain context across multiple turns.
    """

    def __init__(self, max_age_minutes: int = 60):
        """
        Initialize conversation manager

        Args:
            max_age_minutes: Conversations older than this are cleaned up
        """
        self.conversations: Dict[str, Dict[str, Any]] = {}
        self.max_age = timedelta(minutes=max_age_minutes)

    def create_conversation(self) -> str:
        """Create a new conversation and return its ID"""
        conv_id = str(uuid.uuid4())
        self.conversations[conv_id] = {
            "created_at": datetime.now(),
            "messages": []
        }
        return conv_id

    def get_conversation(self, conv_id: str) -> Dict[str, Any]:
        """Get conversation by ID, or create new if not found"""
        if conv_id not in self.conversations:
            self.conversations[conv_id] = {
                "created_at": datetime.now(),
                "messages": []
            }
        return self.conversations[conv_id]

    def add_message(self, conv_id: str, role: str, content: str) -> None:
        """Add a message to conversation history"""
        conv = self.get_conversation(conv_id)
        conv["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now()
        })

    def get_history(self, conv_id: str) -> List[Dict[str, str]]:
        """Get conversation history as message list (role/content only)"""
        conv = self.get_conversation(conv_id)
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in conv["messages"]
        ]

    def clear_conversation(self, conv_id: str) -> None:
        """Clear a specific conversation"""
        if conv_id in self.conversations:
            self.conversations[conv_id]["messages"] = []

    def cleanup_old_conversations(self) -> int:
        """Remove conversations older than max_age. Returns count removed."""
        now = datetime.now()
        to_remove = []

        for conv_id, conv in self.conversations.items():
            if now - conv["created_at"] > self.max_age:
                to_remove.append(conv_id)

        for conv_id in to_remove:
            del self.conversations[conv_id]

        return len(to_remove)


# Global conversation manager
_manager = ConversationManager()


def get_conversation_manager() -> ConversationManager:
    """Get global conversation manager instance"""
    return _manager
