import os
import json
from typing import List, Dict, Any, Optional
from app.config import settings

try:
    from supabase import create_client, Client
    supabase_client: Optional[Client] = (
        create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        if settings.SUPABASE_URL and settings.SUPABASE_KEY
        else None
    )
except Exception as e:
    print(f"Supabase client initialization notice: {e}")
    supabase_client = None

# In-memory storage fallback for offline/instant testing
in_memory_db = {
    "documents": [],
    "patterns": [],
    "chat_history": [],
    "compliance_mappings": []
}

class DatabaseManager:
    @staticmethod
    def save_document(doc_data: Dict[str, Any]) -> Dict[str, Any]:
        if supabase_client:
            try:
                res = supabase_client.table("documents").insert(doc_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as ex:
                print(f"Supabase error inserting document: {ex}")
        
        # Fallback in-memory
        if "id" not in doc_data:
            doc_data["id"] = f"doc_{len(in_memory_db['documents']) + 1}"
        in_memory_db["documents"].append(doc_data)
        return doc_data

    @staticmethod
    def get_all_documents() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("documents").select("*").order("upload_date", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as ex:
                print(f"Supabase error fetching documents: {ex}")
        return sorted(in_memory_db["documents"], key=lambda x: x.get("upload_date", ""), reverse=True)

    @staticmethod
    def get_document_by_id(doc_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("documents").select("*").eq("id", doc_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        for doc in in_memory_db["documents"]:
            if str(doc.get("id")) == str(doc_id):
                return doc
        return None

    @staticmethod
    def save_pattern(pattern_data: Dict[str, Any]) -> Dict[str, Any]:
        if supabase_client:
            try:
                res = supabase_client.table("patterns").upsert(pattern_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as ex:
                print(f"Supabase error saving pattern: {ex}")
        
        # Check if existing pattern in memory
        existing_idx = None
        for idx, pat in enumerate(in_memory_db["patterns"]):
            if pat.get("id") == pattern_data.get("id") or pat.get("title") == pattern_data.get("title"):
                existing_idx = idx
                break
        
        if existing_idx is not None:
            in_memory_db["patterns"][existing_idx] = pattern_data
        else:
            if "id" not in pattern_data:
                pattern_data["id"] = f"pat_{len(in_memory_db['patterns']) + 1}"
            in_memory_db["patterns"].append(pattern_data)
        return pattern_data

    @staticmethod
    def get_all_patterns() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("patterns").select("*").execute()
                if res.data:
                    return res.data
            except Exception as ex:
                print(f"Supabase error fetching patterns: {ex}")
        return in_memory_db["patterns"]

    @staticmethod
    def save_chat_message(msg: Dict[str, Any]) -> Dict[str, Any]:
        if supabase_client:
            try:
                res = supabase_client.table("chat_history").insert(msg).execute()
                if res.data:
                    return res.data[0]
            except Exception as ex:
                print(f"Supabase error saving chat: {ex}")
        
        if "id" not in msg:
            msg["id"] = f"chat_{len(in_memory_db['chat_history']) + 1}"
        in_memory_db["chat_history"].append(msg)
        return msg

    @staticmethod
    def get_chat_history(session_id: str = "default") -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("chat_history").select("*").eq("session_id", session_id).order("timestamp", desc=False).execute()
                if res.data:
                    return res.data
            except Exception as ex:
                print(f"Supabase error fetching chat history: {ex}")
        return [m for m in in_memory_db["chat_history"] if m.get("session_id") == session_id]

    @staticmethod
    def save_compliance_mappings(mappings: List[Dict[str, Any]]):
        if supabase_client:
            try:
                supabase_client.table("compliance_mappings").insert(mappings).execute()
                return
            except Exception as ex:
                print(f"Supabase error saving compliance mappings: {ex}")
        in_memory_db["compliance_mappings"].extend(mappings)

    @staticmethod
    def get_compliance_mappings() -> List[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("compliance_mappings").select("*").execute()
                if res.data:
                    return res.data
            except Exception as ex:
                print(f"Supabase error fetching compliance: {ex}")
        return in_memory_db["compliance_mappings"]

    @staticmethod
    def clear_database():
        global in_memory_db
        in_memory_db = {
            "documents": [],
            "patterns": [],
            "chat_history": [],
            "compliance_mappings": []
        }
