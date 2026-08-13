"""
Image generation endpoint.
Priority:
  1. Gemini 2.0 Flash (generate_content with IMAGE modality) — best free quality
  2. Imagen 3.0 / 3.0-fast (generate_images) — photorealistic
  3. Enhanced HD FLUX/Pollinations — unlimited fallback
"""
import base64
import urllib.parse
import asyncio
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
    gemini_api_key: Optional[str] = None


@router.post("/generate-image")
async def generate_image(req: ImageGenerationRequest):
    """
    Generate an image.
    1. Try Gemini 2.0 Flash image generation (free, high quality)
    2. Try Imagen 3.0 (photorealistic, ~50/day free)
    3. Fallback: Enhanced FLUX HD (unlimited, lower quality)
    Returns: { "url": str, "source": str }
    """
    api_key = req.gemini_api_key or settings.GEMINI_API_KEY

    if api_key and GENAI_AVAILABLE:
        # Try Gemini multimodal image generation first (best free tier option)
        result = await _try_gemini_flash_image(req.prompt, api_key)
        if result:
            return result

        # Try Imagen models
        result = await _try_imagen(req.prompt, api_key)
        if result:
            return result

    # Fallback: Enhanced FLUX
    return _flux_fallback(req.prompt, req.width, req.height)


async def _try_gemini_flash_image(prompt: str, api_key: str) -> Optional[dict]:
    """
    Gemini 2.0 Flash Experimental with image response modality.
    This is the best free option — generates high quality images.
    """
    client = genai.Client(api_key=api_key)

    models_to_try = [
        "gemini-2.0-flash-preview-image-generation",
        "gemini-2.0-flash-exp-image-generation",
        "gemini-2.0-flash-exp",
    ]

    enhanced_prompt = (
        f"Create a high-quality, detailed, visually stunning image of: {prompt}. "
        f"Make it photorealistic with excellent lighting, sharp details, and professional composition."
    )

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=enhanced_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"],
                ),
            )

            if not response or not response.candidates:
                continue

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
                    b64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                    mime = part.inline_data.mime_type or 'image/png'
                    logger.info(f"Image generated via {model_name}")
                    return {
                        "url": f"data:{mime};base64,{b64}",
                        "source": f"gemini-{model_name}",
                    }

        except Exception as e:
            logger.debug(f"Gemini Flash image model {model_name} failed: {e}")
            continue

    return None


async def _try_imagen(prompt: str, api_key: str) -> Optional[dict]:
    """
    Try Imagen 3.0 models — photorealistic, ~50/day free quota.
    """
    client = genai.Client(api_key=api_key)

    imagen_models = [
        "imagen-3.0-fast-generate-001",
        "imagen-3.0-generate-002",
        "imagen-4.0-fast-generate-001",
        "imagen-4.0-generate-001",
    ]

    for model_name in imagen_models:
        try:
            result = client.models.generate_images(
                model=model_name,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    output_mime_type="image/jpeg",
                    safety_filter_level="block_only_high",
                ),
            )
            if result and result.generated_images:
                img_bytes = result.generated_images[0].image.image_bytes
                b64 = base64.b64encode(img_bytes).decode('utf-8')
                logger.info(f"Image generated via {model_name}")
                return {
                    "url": f"data:image/jpeg;base64,{b64}",
                    "source": f"imagen-{model_name}",
                }
        except Exception as e:
            logger.debug(f"Imagen model {model_name} failed: {e}")
            continue

    return None


def _flux_fallback(prompt: str, width: int, height: int) -> dict:
    """
    Enhanced FLUX via Pollinations — unlimited, but lower quality.
    Used only when Gemini quota is exhausted.
    """
    enhanced = (
        f"high quality photorealistic {prompt}, "
        f"8k resolution, detailed, professional photography, sharp focus, "
        f"beautiful lighting, no text, no watermark"
    )
    encoded = urllib.parse.quote(enhanced, safe='')
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width={width}&height={height}&model=flux&enhance=true&nologo=true&private=true&seed={hash(prompt) % 99999}"
    )
    logger.info("Image generated via FLUX fallback")
    return {"url": url, "source": "flux-hd-fallback"}
