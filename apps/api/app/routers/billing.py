"""
Billing HTTP surface. Webhook route stores raw events idempotently; business updates go through services (TODO).
"""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.adapters.payment.stripe_adapter import StripeAdapter
from app.core.config import settings
from app.core.db import get_db
from app.domain.enums import PlanCode, SubscriptionStatus
from app.repositories.payment_event_repository import PaymentEventRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.schemas.billing import (
    CancelSubscriptionResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    SubscriptionInfoResponse,
)
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/billing", tags=["billing"])


def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    adapter = StripeAdapter()
    return PaymentService(
        adapter=adapter,
        subscriptions=SubscriptionRepository(db),
        events=PaymentEventRepository(db),
    )


@router.post("/checkout-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    body: CheckoutSessionRequest,
    # TODO: inject auth user_id
    service: PaymentService = Depends(get_payment_service),
) -> CheckoutSessionResponse:
    if body.plan_code not in (PlanCode.STARTER, PlanCode.PRO):
        raise HTTPException(status_code=400, detail="Invalid plan")
    try:
        return service.create_checkout_session(
            user_id="TODO_AUTH_USER_ID",
            plan_code=body.plan_code,
            success_url=f"{settings.public_app_url}/en/app/subscription?success=1",
            cancel_url=f"{settings.public_app_url}/en/pricing",
        )
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
    db: Session = Depends(get_db),
) -> dict:
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    await request.body()
    # TODO: PaymentEventRepository(db) — idempotent insert by provider_event_id
    # TODO: StripeAdapter.parse_webhook verifies signature; persist + BillingWebhookHandler
    raise HTTPException(status_code=501, detail="TODO: verify + parse + BillingWebhookHandler")


@router.get("/subscription", response_model=SubscriptionInfoResponse)
def get_subscription() -> SubscriptionInfoResponse:
    # TODO: auth + SubscriptionRepository + CreditService balance
    return SubscriptionInfoResponse(
        status=SubscriptionStatus.INCOMPLETE,
        remaining_credits=0,
    )


@router.post("/cancel", response_model=CancelSubscriptionResponse)
def cancel_subscription() -> CancelSubscriptionResponse:
    # TODO: auth + PaymentService.cancel via adapter
    raise HTTPException(status_code=501, detail="TODO")
