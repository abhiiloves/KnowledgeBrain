import os
import json
import httpx
import asyncio
from typing import Dict, Any, Optional
from app.config import settings

try:
    import google.generativeai as genai
except Exception as e:
    print(f"GenerativeAI SDK import notice: {e}")
    genai = None

class GeminiLLMService:
    @staticmethod
    async def generate_text(prompt: str, system_instruction: Optional[str] = None) -> str:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing. Please set your GEMINI_API_KEY in environment variables or Render dashboard.")

        models_to_try = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro"]
        gen_config = {"temperature": 0.2, "max_output_tokens": 8192}

        # 1. Primary: Try Google GenerativeAI SDK
        if genai:
            try:
                genai.configure(api_key=api_key)
                for model_name in models_to_try:
                    try:
                        model = genai.GenerativeModel(model_name, generation_config=gen_config)
                        full_prompt = f"System Instruction: {system_instruction}\n\nTask: {prompt}" if system_instruction else prompt
                        
                        # Execute in thread executor to prevent blocking async loop
                        loop = asyncio.get_event_loop()
                        response = await loop.run_in_executor(None, lambda: model.generate_content(full_prompt))
                        
                        if response and response.text:
                            return response.text.strip()
                    except Exception as model_err:
                        print(f"SDK attempt with {model_name} failed: {model_err}")
            except Exception as sdk_err:
                print(f"SDK configuration error: {sdk_err}")

        # 2. Secondary: Robust HTTP REST API fallback
        async with httpx.AsyncClient(timeout=60.0) as client:
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                contents = [{"role": "user", "parts": [{"text": f"System Instruction: {system_instruction}\n\nTask: {prompt}" if system_instruction else prompt}]}]
                payload = {"contents": contents, "generationConfig": {"temperature": 0.2, "maxOutputTokens": 8192}}
                try:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return parts[0].get("text", "").strip()
                    else:
                        print(f"REST API warning ({res.status_code}) for model {model_name}: {res.text[:200]}")
                except Exception as rest_err:
                    print(f"REST call error for model {model_name}: {rest_err}")

        raise RuntimeError("All Gemini API model calls failed. Please verify your Gemini API key and quota in Google AI Studio.")

    @staticmethod
    async def extract_json(prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        raw_text = await GeminiLLMService.generate_text(
            prompt + "\n\nCRITICAL: Return ONLY valid, raw JSON. Do NOT include markdown blocks (```json), commentary, or formatting.",
            system_instruction
        )
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except Exception as ex:
            print(f"JSON parsing error: {ex}. Raw output: {cleaned[:200]}")
            return {}
