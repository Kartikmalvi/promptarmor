import os
import hashlib
from typing import Dict, Any, List
from supabase import create_client, Client
from app.models.schemas import ClassifyResponse

class SupabaseLogger:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        self.client: Client = create_client(url, key) if url and key else None

    def log(self, prompt: str, classify_result: ClassifyResponse, latency_ms: float):
        """
        Saves classification results to the Supabase database.
        Hashes the prompt text for privacy.
        """
        # Hash the prompt for privacy (SHA256)
        prompt_hash = hashlib.sha256(prompt.encode('utf-8')).hexdigest()
        
        # Determine verdict based on business logic
        if classify_result.confidence > 0.85 and classify_result.is_injection:
            verdict = "blocked"
        elif 0.60 <= classify_result.confidence <= 0.85:
            verdict = "flagged"
        else:
            verdict = "allowed"
            
        data = {
            "prompt_hash": prompt_hash,
            "verdict": verdict,
            "attack_type": classify_result.attack_type,
            "confidence": classify_result.confidence,
            "triggered_rules": classify_result.triggered_rules,
            "latency_ms": latency_ms
        }
        
        if not self.client:
            print(f"SUPABASE NOT CONNECTED - Would have logged: {data}")
            return
            
        try:
            self.client.table("prompt_logs").insert(data).execute()
        except Exception as e:
            print(f"Failed to log to Supabase: {e}")

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.client:
            return []
        try:
            response = self.client.table("prompt_logs").select("*").order("created_at", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"Failed to fetch logs from Supabase: {e}")
            return []

    def get_stats(self) -> Dict[str, Any]:
        if not self.client:
            return {"total": 0, "blocked": 0, "flagged": 0, "allowed": 0, "avg_latency_ms": 0.0}
            
        try:
            response = self.client.table("prompt_logs").select("verdict, latency_ms").execute()
            data = response.data
            
            total = len(data)
            blocked = sum(1 for row in data if row["verdict"] == "blocked")
            flagged = sum(1 for row in data if row["verdict"] == "flagged")
            allowed = sum(1 for row in data if row["verdict"] == "allowed")
            
            avg_latency = sum(row.get("latency_ms", 0) for row in data) / total if total > 0 else 0.0
            
            return {
                "total": total,
                "blocked": blocked,
                "flagged": flagged,
                "allowed": allowed,
                "avg_latency_ms": round(avg_latency, 2)
            }
        except Exception as e:
            print(f"Failed to fetch stats from Supabase: {e}")
            return {"total": 0, "blocked": 0, "flagged": 0, "allowed": 0, "avg_latency_ms": 0.0}

supabase_logger = SupabaseLogger()
