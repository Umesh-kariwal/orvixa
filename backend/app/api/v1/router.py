from fastapi import APIRouter
from app.api.v1 import copilot, health, context, stream, image, tts, youtube

api_v1_router = APIRouter()

# Register health check endpoints
api_v1_router.include_router(health.router, tags=["Health Checks"])

# Register AI Copilot endpoints
api_v1_router.include_router(copilot.router, prefix="/copilot", tags=["AI Copilot Engine"])

# Register Universal Context Intelligence Engine endpoints
api_v1_router.include_router(context.router, tags=["Context Intelligence Engine"])

# Register Real-time AI Streaming Gateway endpoints
api_v1_router.include_router(stream.router, tags=["Real-time AI Streaming Gateway"])

# Register Image Generation endpoints
api_v1_router.include_router(image.router, prefix="/media", tags=["Image Generation"])

# Register Gemini TTS (Text-to-Speech) endpoints
api_v1_router.include_router(tts.router, prefix="/tts", tags=["Gemini TTS Engine"])

# Register YouTube Video Resolver endpoints
api_v1_router.include_router(youtube.router, prefix="/youtube", tags=["YouTube Engine"])
