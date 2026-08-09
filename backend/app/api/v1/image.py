"""
Image generation endpoint.
Primary: Google Gemini Imagen 4.0 / 3.0 via official `google-genai` SDK
  - Fully supports both new `AQ.` authentication keys and legacy `AIzaSy` keys.
Fallback: Pollinations.ai (free, high speed, fallback)
"""
import base64
import urllib.parse
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

router = APIRouter()


class ImageGenerationRequest(BaseModel):
    prompt: str
    width: int = 800
    height: int = 600
    gemini_api_key: Optional[str] = None  # client can pass key dynamically from settings


@router.post("/generate-image")
async def generate_image(req: ImageGenerationRequest):
    """
    Generate an educational diagram/image from a text prompt.
    1. Attempts Gemini Imagen generation using the official `google-genai` SDK.
    2. Falls back seamlessly to Pollinations.ai if key is missing or request fails.
    Returns JSON: { "url": str, "source": str }
    """
    api_key = req.gemini_api_key or settings.GEMINI_API_KEY

    if api_key and GENAI_AVAILABLE:
        try:
            result = await _generate_with_google_sdk(prompt=req.prompt, api_key=api_key)
            if result:
                return result
        except Exception as e:
            logger.warning(f"Google Gemini Imagen generation failed ({e}), falling back to Pollinations.")

    return _build_pollinations_response(req.prompt, req.width, req.height)


async def _generate_with_google_sdk(prompt: str, api_key: str) -> Optional[dict]:
    """Call Google Generative AI SDK for Imagen generation."""
    client = genai.Client(api_key=api_key)

    # Try supported Imagen models in order of speed and capability
    candidate_models = [
        "imagen-4.0-fast-generate-001",
        "imagen-4.0-generate-001",
        "imagen-3.0-generate-002",
    ]

    for model_name in candidate_models:
        try:
            result = client.models.generate_images(
                model=model_name,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    output_mime_type="image/jpeg",
                ),
            )
            if result and result.generated_images:
                img_bytes = result.generated_images[0].image.image_bytes
                b64_str = base64.b64encode(img_bytes).decode("utf-8")
                data_url = f"data:image/jpeg;base64,{b64_str}"
                return {
                    "url": data_url,
                    "source": f"gemini-{model_name}",
                }
        except Exception as err:
            logger.debug(f"Model {model_name} failed: {err}")
            continue

    return None


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
