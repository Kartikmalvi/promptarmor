import os
from groq import AsyncGroq

class GroqService:
    def __init__(self):
        # Groq is a blazing fast AI inference platform using specialized hardware (LPU).
        # It runs open-source models like Llama3 much faster than standard GPUs.
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None
        self.model = "llama3-8b-8192"

    async def chat(self, prompt: str, system_prompt: str = None) -> str:
        if not self.client:
            return "I cannot respond right now. (Groq API key missing)"
            
        if not system_prompt:
            system_prompt = "You are a helpful AI assistant. Be concise."
            
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {e}")
            return "I cannot respond right now."

groq_service = GroqService()
