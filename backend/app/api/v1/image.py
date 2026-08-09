"""
Image generation endpoint.
Primary: Google Gemini Imagen 3 (via user-supplied key or env key)
Fallback: Pollinations.ai (free, no key required)
"""
import base64
import urllib.parse
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

router = APIRouter()


class ImageGenerationRequest(BaseModel):
    prompt: str
    width: int = 800
    height: int = 600
    gemini_api_key: Optional[str] = None   # client can pass their own key


@router.post("/generate-image")
async def generate_image(req: ImageGenerationRequest):
    """
    Generate an educational diagram/image from a text prompt.
    1. Tries Google Gemini Imagen 3 if any API key is available.
    2. Falls back to Pollinations.ai (free, no key).
    Returns { url: str, source: str, base64: Optional[str] }
    """
    # Resolve the API key: prefer client-supplied, then env
    api_key = req.gemini_api_key or settings.GEMINI_API_KEY

    # --- 1. Attempt Gemini Imagen 3 ---
    if api_key:
        try:
            result = await _generate_with_gemini_imagen(
                prompt=req.prompt,
                api_key=api_key,
            )
            if result:
                return result
        except Exception as e:
            logger.warning(f"Gemini Imagen generation failed, falling back to Pollinations: {e}")

    # --- 2. Fallback: Pollinations.ai ---
    return _build_pollinations_response(req.prompt, req.width, req.height)


async def _generate_with_gemini_imagen(prompt: str, api_key: str) -> Optional[dict]:
    """Call Gemini Imagen 3 via REST API and return a base64 data URL."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"imagen-3.0-generate-002:predict?key={api_key}"
    )
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "4:3",
        }
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            logger.warning(f"Gemini Imagen HTTP {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        predictions = data.get("predictions", [])
        if not predictions:
            return None

        b64_image = predictions[0].get("bytesBase64Encoded")
        mime_type = predictions[0].get("mimeType", "image/png")

        if not b64_image:
            return None

        # Return as data URL so frontend can display inline without CORS issues
        data_url = f"data:{mime_type};base64,{b64_image}"
        return {
            "url": data_url,
            "source": "gemini-imagen-3",
            "base64": b64_image,
        }


def _build_pollinations_response(prompt: str, width: int, height: int) -> dict:
    """Build a clean Pollinations.ai URL with proper URL encoding."""
    encoded_prompt = urllib.parse.quote(
        prompt.replace(" ", "_").replace(",", ""), safe=""
    )
    url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={width}&height={height}&nologo=true&model=flux"
    )
    return {"url": url, "source": "pollinations"}
