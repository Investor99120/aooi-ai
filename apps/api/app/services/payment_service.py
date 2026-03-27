from __future__ import annotations

from app.adapters.payment.base import PaymentProviderAdapter
from app.domain.enums import PlanCode
from app.repositories.payment_event_repository import PaymentEventRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.schemas.billing import CheckoutSessionResponse


class PaymentService:
    """
    Orchestrates checkout creation and (later) webhook side-effects.
    Depends on adapter Protocol — swap Stripe/Creem without changing callers.
    """

    def __init__(
        self,
        adapter: PaymentProviderAdapter,
        subscriptions: SubscriptionRepository,
        events: PaymentEventRepository,
    ) -> None:
        self._adapter = adapter
        self._subscriptions = subscriptions
        self._events = events

    def create_checkout_session(
        self,
        *,
        user_id: str,
        plan_code: PlanCode,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSessionResponse:
        result = self._adapter.create_checkout_session(
            user_id=user_id,
            plan_code=plan_code,
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return CheckoutSessionResponse(checkout_url=result.checkout_url)

    # Webhook handling will live in BillingWebhookHandler + CreditService; keep PaymentService thin for batch 1.
