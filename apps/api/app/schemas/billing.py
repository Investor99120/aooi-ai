from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.enums import PlanCode, SubscriptionStatus


class CheckoutSessionRequest(BaseModel):
    plan_code: PlanCode


class CheckoutSessionResponse(BaseModel):
    checkout_url: str


class SubscriptionInfoResponse(BaseModel):
    plan_code: PlanCode | None = None
    status: SubscriptionStatus
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    cancel_at_period_end: bool = False
    remaining_credits: int = Field(ge=0, default=0)


class CancelSubscriptionResponse(BaseModel):
    ok: bool = True
