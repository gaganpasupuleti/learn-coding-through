from datetime import datetime

from pydantic import BaseModel, Field


class CreditBalanceResponse(BaseModel):
    balance: int


class CreditTransactionResponse(BaseModel):
    id: int
    transaction_type: str
    amount: int
    balance_after: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConsumeCreditsRequest(BaseModel):
    amount: int = Field(..., ge=1, le=10000)
    reason: str = Field(..., min_length=2, max_length=255)


class AddCreditsRequest(BaseModel):
    user_id: int
    amount: int = Field(..., ge=1, le=10000)
    reason: str = Field(..., min_length=2, max_length=255)
