"""
Image generation endpoint.
Primary: Google Gemini (Gemini 2.5 Flash Image / Gemini 3.1 Flash Image / Imagen 3.0 / Imagen 4.0) via `google-genai` SDK
  - Handles both `generate_images` and `generate_content` multimodal inline output.
  - Supports both new `AQ.` authentication keys and legacy `AIzaSy` keys.
Fallback: Enhanced High-Definition FLUX Visual Engine (crystal clear educational diagrams)
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
    1. Attempts Gemini Image Generation using the official `google-genai` SDK.
    2. Falls back to HD Enhanced FLUX Engine if key is missing or quota/model limits occur.
    Returns JSON: { "url": str, "source": str }
    """
    api_key = req.gemini_api_key or settings.GEMINI_API_KEY

    if api_key and GENAI_AVAILABLE:
        try:
            result = await _generate_with_google_sdk(prompt=req.prompt, api_key=api_key)
            if result:
                return result
        except Exception as e:
            logger.warning(f"Google Gemini Image generation notice ({e}), routing to Enhanced HD Visual Engine.")

    return _build_enhanced_hd_visual_response(req.prompt, req.width, req.height)


async def _generate_with_google_sdk(prompt: str, api_key: str) -> Optional[dict]:
    """Call Google Generative AI SDK for Gemini / Imagen generation."""
    client = genai.Client(api_key=api_key)

    # 1. Try Gemini Multimodal Image Generation Models (generate_content)
    multimodal_image_models = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3-pro-image",
    ]

    for model_name in multimodal_image_models:
        try:
            res = client.models.generate_content(
                model=model_name,
                contents=f"Generate a clear, detailed, HD educational illustration for: {prompt}",
            )
            if res and res.candidates:
                for part in res.candidates[0].content.parts:
                    if hasattr(part, "inline_data") and part.inline_data:
                        b64_str = base64.b64encode(part.inline_data.data).decode("utf-8")
                        mime = part.inline_data.mime_type or "image/png"
                        return {
                            "url": f"data:{mime};base64,{b64_str}",
                            "source": f"google-{model_name}",
                        }
        except Exception as err:
            logger.debug(f"Gemini model {model_name} content error: {err}")
            continue

    # 2. Try Imagen Direct Generation Models (generate_images)
    imagen_models = [
        "imagen-3.0-generate-002",
        "imagen-3.0-fast-generate-001",
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
                ),
            )
            if result and result.generated_images:
                img_bytes = result.generated_images[0].image.image_bytes
                b64_str = base64.b64encode(img_bytes).decode("utf-8")
                return {
                    "url": f"data:image/jpeg;base64,{b64_str}",
                    "source": f"google-{model_name}",
                }
        except Exception as err:
            logger.debug(f"Imagen model {model_name} error: {err}")
            continue

    return None


def _build_enhanced_hd_visual_response(prompt: str, width: int, height: int) -> dict:
    """
    Build a high-definition FLUX visual diagram URL.
    Uses proper URL percent-encoding (spaces preserved as %20, no underscores),
    HD educational prompt enhancement, and FLUX realism engine.
    """
    enhanced_prompt = (
        f"high quality crystal clear educational diagram illustration of {prompt}, "
        f"detailed visual representation, clean 8k resolution, HD schematic graphics, studio lighting"
    )
    encoded_prompt = urllib.parse.quote(enhanced_prompt, safe="")
    
    url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={width}&height={height}&model=flux&enhance=true&nologo=true&private=true"
    )
    return {"url": url, "source": "enhanced-flux-hd"}
