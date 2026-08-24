from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()


class AgentStepSchema(BaseModel):
    id: int
    title: str
    action_type: str
    target_tool: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    detail: Optional[str] = None


class AgentPlanResponse(BaseModel):
    goal: str
    confidence: float
    reasoning: str
    steps: List[AgentStepSchema]


class AgentOrchestrateRequest(BaseModel):
    prompt: str = Field(..., description="User voice or text prompt")
    active_url: Optional[str] = None
    page_title: Optional[str] = None
    screen_width: Optional[int] = 1920
    screen_height: Optional[int] = 1080


@router.post(
    "/plan",
    response_model=AgentPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Autonomous Execution Graph",
    description="Analyzes user goal and generates an executable DAG of SOTA tools.",
)
async def generate_agent_plan(payload: AgentOrchestrateRequest) -> AgentPlanResponse:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty",
        )

    t = prompt.lower()

    # 1. E-Commerce Deal & Price Comparison
    if any(k in t for k in ["compare", "price", "deal", "amazon", "flipkart"]):
        item = (
            prompt.replace("compare", "")
            .replace("price", "")
            .replace("on", "")
            .replace("amazon", "")
            .replace("flipkart", "")
            .strip()
            or "iPhone 15"
        )
        return AgentPlanResponse(
            goal=f"Multi-Store Deal & Price Comparison for '{item}'",
            confidence=0.98,
            reasoning="Constructing parallel search DAG across major e-commerce platforms and Google Shopping.",
            steps=[
                AgentStepSchema(
                    id=1,
                    title=f"Execute Deep Amazon Store Search for '{item}'",
                    action_type="open_url",
                    target_tool="browser_navigation",
                    arguments={
                        "url": f"https://www.amazon.in/s?k={item}"
                    },
                    detail=item,
                ),
                AgentStepSchema(
                    id=2,
                    title=f"Execute Deep Flipkart Store Search for '{item}'",
                    action_type="open_url",
                    target_tool="browser_navigation",
                    arguments={
                        "url": f"https://www.flipkart.com/search?q={item}"
                    },
                    detail=item,
                ),
                AgentStepSchema(
                    id=3,
                    title=f"Aggregate Live Prices on Google Shopping",
                    action_type="open_url",
                    target_tool="browser_navigation",
                    arguments={
                        "url": f"https://www.google.com/search?tbm=shop&q={item}"
                    },
                    detail=item,
                ),
            ],
        )

    # 2. YouTube Video Auto-Play + WhatsApp Cross-App Share
    if "whatsapp" in t and ("youtube" in t or "song" in t or "video" in t):
        recipient = "Contact"
        if "to" in t:
            parts = t.split("to")
            if len(parts) > 1:
                recipient = parts[1].strip().split()[0].title()

        song = (
            prompt.replace("whatsapp", "")
            .replace("send", "")
            .replace("to", "")
            .replace("share", "")
            .replace("song", "")
            .strip()
            or "Kesariya"
        )

        return AgentPlanResponse(
            goal=f"Auto-Play '{song}' on YouTube & Share Link with {recipient} on WhatsApp",
            confidence=0.96,
            reasoning="Resolving video watch URL via Video ID resolver and launching WhatsApp Desktop pre-filled message.",
            steps=[
                AgentStepSchema(
                    id=1,
                    title=f"Resolve Direct 11-char YouTube Video ID for '{song}'",
                    action_type="resolve_youtube",
                    target_tool="youtube_resolver",
                    arguments={"query": song},
                    detail=song,
                ),
                AgentStepSchema(
                    id=2,
                    title=f"Format WhatsApp Share Card with Direct Watch Link",
                    action_type="format_message",
                    target_tool="text_formatter",
                    arguments={"recipient": recipient, "song": song},
                    detail=recipient,
                ),
                AgentStepSchema(
                    id=3,
                    title=f"Launch WhatsApp Desktop App & Pre-fill Message",
                    action_type="launch_whatsapp",
                    target_tool="native_launcher",
                    arguments={"recipient": recipient},
                    detail=recipient,
                ),
            ],
        )

    # 3. Calendar Event & Meeting Scheduler
    if any(k in t for k in ["schedule", "meeting", "calendar", "reminder"]):
        title = (
            prompt.replace("schedule", "")
            .replace("meeting", "")
            .replace("reminder", "")
            .replace("calendar", "")
            .strip()
            or "Important Meeting"
        )
        return AgentPlanResponse(
            goal=f"Schedule Google Calendar Event: '{title}'",
            confidence=0.95,
            reasoning="Constructing Google Calendar TEMPLATE URL with pre-filled title and AI metadata.",
            steps=[
                AgentStepSchema(
                    id=1,
                    title=f"Format Event Parameters for '{title}'",
                    action_type="format_meeting",
                    target_tool="calendar_formatter",
                    arguments={"title": title},
                    detail=title,
                ),
                AgentStepSchema(
                    id=2,
                    title="Launch Google Calendar Event Creator",
                    action_type="open_url",
                    target_tool="browser_navigation",
                    arguments={
                        "url": f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&details=Created+via+Orvixa+AI+Agent"
                    },
                    detail=title,
                ),
            ],
        )

    # 4. System Hardware Controls (Volume & Screen Lock)
    if "volume" in t or "aawaaz" in t or "sound" in t:
        action = "volume_up" if any(k in t for k in ["up", "badhao", "increase"]) else "volume_down"
        return AgentPlanResponse(
            goal="Hardware Master Volume Adjustment",
            confidence=0.99,
            reasoning="Dispatching native Win32 hardware key events via Tauri Rust Kernel.",
            steps=[
                AgentStepSchema(
                    id=1,
                    title="Dispatch Hardware Master Volume Keystrokes",
                    action_type="media_control",
                    target_tool="rust_native_kernel",
                    arguments={"action": action},
                    detail=action,
                )
            ],
        )

    # 5. Default General Agent Execution Plan
    return AgentPlanResponse(
        goal=f"Execute Autonomous Plan for '{prompt}'",
        confidence=0.90,
        reasoning="Delegating query to Gemini Copilot Context & Navigation Engine.",
        steps=[
            AgentStepSchema(
                id=1,
                title=f"Execute General Agent Workflow for '{prompt}'",
                action_type="general_action",
                target_tool="orvixa_agent_kernel",
                arguments={"query": prompt},
                detail=prompt,
            )
        ],
    )
