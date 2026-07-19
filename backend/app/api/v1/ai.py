from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


class HuggingFaceStatusResponse(BaseModel):
    provider: str = "huggingface"
    enabled: bool
    model: str | None = None


class HuggingFaceGenerateRequest(BaseModel):
    prompt: str


class HuggingFaceGenerateResponse(BaseModel):
    provider: str = "huggingface"
    enabled: bool
    text: str | None = None
    error: str | None = None


@router.get("/huggingface/status", response_model=HuggingFaceStatusResponse)
def huggingface_status() -> HuggingFaceStatusResponse:
    return HuggingFaceStatusResponse(
        enabled=settings.enable_huggingface_ai,
        model=settings.hf_model,
    )


@router.post("/huggingface/generate", response_model=HuggingFaceGenerateResponse)
def huggingface_generate(_request: HuggingFaceGenerateRequest) -> HuggingFaceGenerateResponse:
    if not settings.enable_huggingface_ai:
        return HuggingFaceGenerateResponse(
            enabled=False,
            error="provider_not_enabled",
        )

    if not settings.hf_token or not settings.hf_model:
        raise HTTPException(status_code=503, detail="huggingface_not_configured")

    raise HTTPException(status_code=501, detail="huggingface_generation_not_implemented")
