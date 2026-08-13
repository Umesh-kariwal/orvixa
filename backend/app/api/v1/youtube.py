import asyncio
import re
import urllib.request
from urllib.parse import quote
from fastapi import APIRouter, Query

router = APIRouter()

def fetch_youtube_video_id(query: str) -> str | None:
    try:
        url = f"https://www.youtube.com/results?search_query={quote(query)}&sp=EgIQAQ%3D%3D"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            html = resp.read().decode('utf-8')
            matches = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
            if matches:
                valid = [m for m in matches if m not in ('googleadserv', 'youtubecom')]
                if valid:
                    return valid[0]
    except Exception as e:
        print(f"[YouTube Resolver Sync Error] {e}")
    return None

@router.get("/search")
async def search_youtube(q: str = Query(..., description="Song or video search query")):
    """
    Fast YouTube Video ID Resolver for Zero-Error In-App Embed Playing.
    Converts any search query ("kesariya", "all black") into an official YouTube embeddable Video ID.
    """
    clean_q = q.strip()
    if not clean_q:
        return {"videoId": None, "embedUrl": None}

    vid_id = await asyncio.to_thread(fetch_youtube_video_id, clean_q)
    if vid_id:
        return {
            "videoId": vid_id,
            "embedUrl": f"https://www.youtube.com/embed/{vid_id}?autoplay=1&enablejsapi=1",
            "title": clean_q.title()
        }
    return {"videoId": None, "embedUrl": None}
