"""
Gemini TTS (Text-to-Speech) Endpoint.
Uses Google Gemini TTS models to generate high-quality, expressive female audio.
Returns base64-encoded WAV audio that the frontend plays via <audio> element.
Falls back to plain text signal if API key missing.
"""
import base64
import struct
import wave
import io
from fastapi import APIRouter
from fastapi.responses import Response
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

# Available Gemini TTS female voices (in order of quality/expressiveness)
FEMALE_VOICES = ["Aoede", "Kore", "Leda", "Zephyr"]


class TTSRequest(BaseModel):
    text: str
    voice: str = "Aoede"          # Default: Aoede (warm, expressive female)
    gemini_api_key: Optional[str] = None
    is_singing: bool = False       # Hint to use more expressive performance prompting


def _pcm_to_wav_bytes(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, bit_depth: int = 16) -> bytes:
    """Convert raw PCM bytes to proper WAV file bytes."""
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(bit_depth // 8)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    return buf.getvalue()


def _clean_text_for_tts(text: str) -> str:
    """Remove markdown, emojis, image tags for clean audio synthesis."""
    import re
    # Remove markdown code blocks
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]+`', lambda m: m.group()[1:-1], text)
    # Remove image tags
    text = re.sub(r'\[IMAGE:.*?\]', '', text, flags=re.DOTALL)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Remove all emojis (Unicode ranges)
    text = re.sub(r'[\U0001F300-\U0001FFFF\U00002600-\U000027FF\U0000FE00-\U0000FEFF]', '', text)
    # Remove markdown symbols
    text = re.sub(r'[*#_\\`]', ' ', text)
    # Collapse multiple whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


@router.post("/synthesize")
async def synthesize_speech(req: TTSRequest):
    """
    Synthesize expressive high-quality speech using Gemini TTS.
    Returns audio/wav binary response.
    """
    api_key = req.gemini_api_key or settings.GEMINI_API_KEY

    if not api_key or not GENAI_AVAILABLE:
        return Response(content=b"", status_code=204, media_type="audio/wav")

    clean_text = _clean_text_for_tts(req.text)
    if not clean_text:
        return Response(content=b"", status_code=204, media_type="audio/wav")

    # For singing, add expressive performance instruction
    if req.is_singing:
        prompt = (
            f"Sing the following song lyrics with a warm, expressive, melodious female voice. "
            f"Add natural singing rhythm, melody, and emotion:\n\n{clean_text}"
        )
    else:
        prompt = clean_text

    # Try TTS models in order of preference
    tts_models = [
        "gemini-2.5-flash-preview-tts",
        "gemini-2.5-pro-preview-tts",
    ]

    voice_name = req.voice if req.voice in FEMALE_VOICES else "Aoede"

    client = genai.Client(api_key=api_key)

    for model_name in tts_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name
                            )
                        )
                    )
                )
            )

            if not response.candidates:
                continue

            part = response.candidates[0].content.parts[0]
            if not part.inline_data:
                continue

            audio_bytes = part.inline_data.data
            mime = part.inline_data.mime_type or ""

            # Convert PCM to WAV if needed
            if "L16" in mime or "pcm" in mime.lower():
                # Extract sample rate from mime type (e.g. audio/L16;codec=pcm;rate=24000)
                import re
                rate_match = re.search(r'rate=(\d+)', mime)
                sample_rate = int(rate_match.group(1)) if rate_match else 24000
                wav_bytes = _pcm_to_wav_bytes(audio_bytes, sample_rate=sample_rate)
            else:
                wav_bytes = audio_bytes  # Already WAV or MP3

            logger.info(f"Gemini TTS success: model={model_name}, voice={voice_name}, size={len(wav_bytes)}")
            return Response(
                content=wav_bytes,
                media_type="audio/wav",
                headers={
                    "X-TTS-Model": model_name,
                    "X-TTS-Voice": voice_name,
                }
            )

        except Exception as e:
            logger.warning(f"TTS model {model_name} failed: {e}")
            continue

    # All models failed
    return Response(content=b"", status_code=204, media_type="audio/wav")
