from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.database import get_db
from app.models.models import CreditTransaction, CreditTransactionType, User
from app.schemas.credits import (
    AddCreditsRequest,
    ConsumeCreditsRequest,
    CreditBalanceResponse,
    CreditTransactionResponse,
)


router = APIRouter(prefix="/credits", tags=["Credits"])


@router.get("/balance", response_model=CreditBalanceResponse)
def get_balance(current_user: User = Depends(get_current_user)):
    return CreditBalanceResponse(balance=current_user.credit_balance)


@router.get("/history", response_model=list[CreditTransactionResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(CreditTransaction)
        .filter(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(100)
        .all()
    )
    return transactions


@router.post("/consume", response_model=CreditBalanceResponse)
def consume_credits(
    payload: ConsumeCreditsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.credit_balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    current_user.credit_balance -= payload.amount
    db.add(
        CreditTransaction(
            user_id=current_user.id,
            transaction_type=CreditTransactionType.DEBIT,
            amount=payload.amount,
            balance_after=current_user.credit_balance,
            reason=payload.reason,
        )
    )
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return CreditBalanceResponse(balance=current_user.credit_balance)


@router.post("/add", response_model=CreditBalanceResponse)
def add_credits(
    payload: AddCreditsRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.credit_balance += payload.amount
    db.add(
        CreditTransaction(
            user_id=user.id,
            transaction_type=CreditTransactionType.CREDIT,
            amount=payload.amount,
            balance_after=user.credit_balance,
            reason=payload.reason,
        )
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return CreditBalanceResponse(balance=user.credit_balance)
