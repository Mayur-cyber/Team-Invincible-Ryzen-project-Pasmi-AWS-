from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request

from app.services import ai_service
from app.schemas.dashboard_schemas import AIProcessResponse


async def get_current_user(request: Request):
    # placeholder - adapt to Neon Auth later
    return {"id": "dummy-user-id"}


router = APIRouter()


@router.post("/process", response_model=AIProcessResponse)
async def process_video(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Receive a video upload, transcribe it, then ask the AI to generate both a
    caption and a thumbnail prompt.  The frontend can call this endpoint during
    the "Create Post" flow.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user session")

    try:
        # 1. Transcribe the video file
        transcript = await ai_service.transcribe_video(file)
        
        # 2. Generate titles and hashtags
        titles, hashtags = await ai_service.generate_content_metadata(transcript)
        
        # 3. Generate thumbnail images using Imagen 3
        thumbnails = await ai_service.generate_thumbnail_images(transcript, count=2)
        
        return AIProcessResponse(
            transcript=transcript,
            titles=titles,
            thumbnails=thumbnails,
            hashtags=hashtags
        )
    except Exception as exc:
        # propagate as 500 so frontend can surface error message
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
