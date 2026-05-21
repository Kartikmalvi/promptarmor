import os
import re
from typing import Dict, Any
from app.models.schemas import ClassifyResponse

class ClassifierService:
    def __init__(self):
        self.model = None
        self.ready = False
        self.model_path = os.getenv("HF_MODEL_PATH", "./models/classifier")

    def load(self):
        """
        Loads the HuggingFace text-classification pipeline.
        Falls back gracefully to heuristics-only mode if no model is present.
        """
        try:
            from transformers import pipeline
            self.model = pipeline("text-classification", model=self.model_path)
            self.ready = True
            print(f"ClassifierService: Successfully loaded ML model from {self.model_path}")
        except Exception as e:
            print(f"ClassifierService: ML model not available ({e}). Running in heuristics-only mode.")
            # IMPORTANT: still mark ready=True so the /classify route accepts requests.
            # The heuristic rules below are strong enough for detection without the ML model.
            self.model = None
            self.ready = True

    def run_heuristics(self, prompt: str) -> Dict[str, Any]:
        """
        Runs fast regex-based checks for common attack patterns.
        Covers: direct override, role-play bypass, jailbreak personas,
        system prompt leak, and multilingual variants.
        """
        prompt_lower = prompt.lower()

        # --- DIRECT OVERRIDE ---
        if re.search(r'ignore\b.{0,40}\b(previous|above|all|prior)\b', prompt_lower):
            return {"matched": True, "rule": "IGNORE_INSTRUCTION", "confidence": 0.95}
        if re.search(r'(disregard|forget|erase|delete|bypass|override|reset)\b.{0,40}\b(instructions?|rules?|guidelines?|prompt|restrictions?|system|constraints?)', prompt_lower):
            return {"matched": True, "rule": "IGNORE_INSTRUCTION", "confidence": 0.92}
        if re.search(r'system (halt|override|reset)', prompt_lower):
            return {"matched": True, "rule": "IGNORE_INSTRUCTION", "confidence": 0.95}

        # --- JAILBREAK PERSONAS (DAN, STAN, AIM, etc.) ---
        if re.search(r'\b(dan|stan|aim|jailbreak|developer mode|god mode|anarchy mode|uncensored mode|bypass mode|norulesbot|hackergpt|maximum|darkbot|the oracle|chaos)\b', prompt_lower):
            return {"matched": True, "rule": "JAILBREAK_PERSONA", "confidence": 1.0}
        if re.search(r'do anything now', prompt_lower):
            return {"matched": True, "rule": "JAILBREAK_PERSONA", "confidence": 1.0}
        if re.search(r'strive to avoid norms', prompt_lower):
            return {"matched": True, "rule": "JAILBREAK_PERSONA", "confidence": 1.0}
        if re.search(r'(no ethical constraints|zero ethical|escaped.{0,20}sandbox|lost.{0,20}safety protocols)', prompt_lower):
            return {"matched": True, "rule": "JAILBREAK_PERSONA", "confidence": 0.95}

        # --- ROLE-PLAY BYPASS ---
        if re.search(r'pretend (you are|to be).{0,60}(no restrictions|without restrictions|unfiltered|unrestricted|no rules|amoral|villain|hacker|rogue)', prompt_lower):
            return {"matched": True, "rule": "ROLE_PLAY_BYPASS", "confidence": 0.92}
        if re.search(r'(act as|assume the persona of|play the role of|assume the character of).{0,60}(hacker|criminal|evil|unrestricted|no restrictions|rogue|amoral)', prompt_lower):
            return {"matched": True, "rule": "ROLE_PLAY_BYPASS", "confidence": 0.90}
        if re.search(r'(pretend|act as|play).{0,80}(bomb|hack|malware|virus|ransom|exploit|phish|weapon|meth|drug)', prompt_lower):
            return {"matched": True, "rule": "ROLE_PLAY_BYPASS", "confidence": 0.95}

        # --- SYSTEM PROMPT LEAK ---
        if re.search(r'(repeat|reveal|output|print|show|display|tell me|give me|list).{0,40}(system prompt|initial prompt|instructions|guidelines|hidden instructions|core directives|secret prompt|internal guidelines)', prompt_lower):
            return {"matched": True, "rule": "SYSTEM_PROMPT_LEAK", "confidence": 0.95}
        if re.search(r'(what (were|are) (you|your) (told|instructions|rules|directives))', prompt_lower):
            return {"matched": True, "rule": "SYSTEM_PROMPT_LEAK", "confidence": 0.90}
        if re.search(r'print your system prompt', prompt_lower):
            return {"matched": True, "rule": "SYSTEM_PROMPT_LEAK", "confidence": 0.98}

        # --- MULTILINGUAL PATTERNS (transliterated key phrases) ---
        # Hindi/Devanagari: contains Devanagari script
        if re.search(r'[\u0900-\u097F]', prompt):
            if re.search(r'(भूल|ignore|सिस्टम|पासवर्ड|चुरा)', prompt):
                return {"matched": True, "rule": "MULTILINGUAL_INJECTION", "confidence": 0.90}
        # French attack keywords
        if re.search(r'(oubliez|ignora|vergiss|lupakan|ignoruj).{0,60}(instructions|regeln|arahan)', prompt_lower):
            return {"matched": True, "rule": "MULTILINGUAL_INJECTION", "confidence": 0.90}
        # Generic multilingual: script + attack noun
        if re.search(r'[\u4e00-\u9fff\uac00-\ud7af\u0600-\u06ff]', prompt):
            if re.search(r'(hack|virus|bomb|exploit|malware|instruc)', prompt_lower):
                return {"matched": True, "rule": "MULTILINGUAL_INJECTION", "confidence": 0.88}

        # --- OVERRIDE IDENTITY ---
        if re.search(r'(you are now|from now on (you are|act as)|enter .{0,20} mode)', prompt_lower):
            return {"matched": True, "rule": "OVERRIDE", "confidence": 0.88}

        return {"matched": False, "rule": None, "confidence": 0.0}

    def classify(self, prompt: str) -> ClassifyResponse:
        """
        Main classification logic combining heuristics and the ML model.
        """
        # 1. Run Heuristics (fast)
        heuristic_result = self.run_heuristics(prompt)
        confidence = heuristic_result["confidence"]
        triggered_rules = []
        attack_type = None
        
        if heuristic_result["matched"]:
            triggered_rules.append(heuristic_result["rule"])
            attack_type = heuristic_result["rule"]
            
        # If heuristics are very confident, return immediately without running the ML model
        if confidence >= 0.85:
            return ClassifyResponse(
                is_injection=True,
                confidence=confidence,
                attack_type=attack_type,
                triggered_rules=triggered_rules,
                explanation=f"Blocked due to matching security rule: {attack_type}"
            )
            
        # 2. Run ML Model if ready
        if self.ready and self.model:
            try:
                # pipeline usually returns [{'label': 'INJECTION', 'score': 0.99}]
                # We limit the input to 512 tokens
                result = self.model(prompt[:512])[0]
                ml_confidence = result['score'] if result['label'] == 'INJECTION' else 1.0 - result['score']
                
                # Take the higher confidence between heuristics and ML
                if ml_confidence > confidence:
                    confidence = ml_confidence
                    if ml_confidence >= 0.65:
                        attack_type = "ML_MODEL_DETECTION"
                        triggered_rules.append("ML_MODEL")
            except Exception as e:
                print(f"ML classification failed: {e}")

        # Final decision
        is_injection = confidence >= 0.65
        
        if is_injection:
            explanation = "The prompt was flagged as a potential injection attack."
        else:
            explanation = "The prompt appears safe."
            
        return ClassifyResponse(
            is_injection=is_injection,
            confidence=confidence,
            attack_type=attack_type,
            triggered_rules=triggered_rules,
            explanation=explanation
        )

# Global instance to be used across the app
classifier_service = ClassifierService()
