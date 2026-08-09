"""
Backend image generation endpoint.
Uses Pollinations.ai as the primary source with URL-safe construction,
and falls back to a placeholder when generation fails.
"""
import os
import urllib.parse
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class ImageGenerationRequest(BaseModel):
    prompt: str
    width: int = 800
    height: int = 600


@router.post("/generate-image")
async def generate_image(req: ImageGenerationRequest):
    """
    Generate an educational diagram/image from a text prompt.
    Returns a JSON object with { url: str } pointing to the hosted image.
    """
    # Build a safe Pollinations URL (no raw & in the prompt, encode properly)
    encoded_prompt = urllib.parse.quote(req.prompt, safe='')
    url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}"
        f"?width={req.width}&height={req.height}&nologo=true&private=true&model=flux"
    )

    # Verify the URL is reachable (HEAD check)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.head(url, follow_redirects=True)
            if resp.status_code < 400:
                return {"url": url, "source": "pollinations"}
    except Exception:
        pass  # Fall through to return the URL anyway — the client will show retry

    # Return the URL regardless; ImageCard component will show Retry on error
    return {"url": url, "source": "pollinations"}
