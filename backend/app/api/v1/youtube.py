import re
from urllib.parse import quote
import httpx
from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/search")
async def search_youtube(q: str = Query(..., description="Song or video search query")):
    """
    Fast YouTube Video ID Resolver for Zero-Error In-App Embed Playing.
    Converts any search query ("kesariya", "all black") into an official YouTube embeddable Video ID.
    """
    clean_q = q.strip()
    if not clean_q:
        return {"videoId": None, "embedUrl": None}

    try:
        url = f"https://www.youtube.com/results?search_query={quote(clean_q)}&sp=EgIQAQ%3D%3D"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            matches = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', resp.text)
            if matches:
                valid_ids = [m for m in matches if m not in ('googleadserv', 'youtubecom')]
                if valid_ids:
                    vid_id = valid_ids[0]
                    return {
                        "videoId": vid_id,
                        "embedUrl": f"https://www.youtube.com/embed/{vid_id}?autoplay=1&enablejsapi=1",
                        "title": clean_q.title()
                    }
    except Exception as e:
        print(f"[YouTube Resolver Error] {e}")

    return {"videoId": None, "embedUrl": None}
