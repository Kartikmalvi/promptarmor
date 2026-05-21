import time
import asyncio
from fastapi import APIRouter, HTTPException
from app.models.schemas import ClassifyRequest, ClassifyResponse
from app.services.classifier import classifier_service
from app.services.supabase_logger import supabase_logger

router = APIRouter()

def sanitize_prompt(prompt: str) -> str:
    # Remove null bytes and zero-width characters
    sanitized = prompt.replace('\x00', '')
    sanitized = sanitized.replace('\u200b', '')
    sanitized = sanitized.replace('\u200c', '')
    sanitized = sanitized.replace('\u200d', '')
    # Limit to 10000 characters
    return sanitized[:10000]

@router.post("/api/v1/classify", response_model=ClassifyResponse)
async def classify_prompt(request: ClassifyRequest):
    if not classifier_service.ready:
        # 503 is standard for "Service Unavailable" (e.g. still loading)
        raise HTTPException(status_code=503, detail="Classifier is still loading")
        
    start_time = time.perf_counter()
    
    clean_prompt = sanitize_prompt(request.prompt)
    
    # Run classification logic
    result = classifier_service.classify(clean_prompt)
    
    # Calculate latency in milliseconds
    latency_ms = (time.perf_counter() - start_time) * 1000
    
    # Determine verdict for console logging
    if result.confidence > 0.85 and result.is_injection:
        verdict = "BLOCKED"
    elif 0.60 <= result.confidence <= 0.85:
        verdict = "FLAGGED"
    else:
        verdict = "ALLOWED"
        
    # Print to console
    preview = clean_prompt[:50].replace('\n', ' ')
    print(f"CLASSIFY | {preview}... | {verdict} | {result.confidence:.2f} | {latency_ms:.2f}ms")
    
    # Log to Supabase async (fire and forget)
    asyncio.create_task(asyncio.to_thread(supabase_logger.log, clean_prompt, result, latency_ms))
    
    return result
