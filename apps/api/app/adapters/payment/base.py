from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from app.domain.enums import PaymentProviderName, PlanCode, SubscriptionStatus


@dataclass(frozen=True)
class CheckoutSessionResult:
    checkout_url: str
    provider_session_id: str


@dataclass(frozen=True)
class ProviderSubscription:
    provider_subscription_id: str
    provider_customer_id: str
    status: SubscriptionStatus
    plan_code: PlanCode | None
    current_period_start: Any  # datetime
    current_period_end: Any
    cancel_at_period_end: bool


@dataclass(frozen=True)
class BillingWebhookEvent:
    """Normalized event after provider-specific parse."""

    provider: PaymentProviderName
    event_id: str
    event_type: str
    raw_payload: dict[str, Any]


class PaymentProviderAdapter(Protocol):
    """Implement per provider (Stripe, Creem). Business layer depends on PaymentService only."""

    name: PaymentProviderName

    def create_checkout_session(
        self,
        *,
        user_id: str,
        plan_code: PlanCode,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSessionResult: ...

    def parse_webhook(self, *, headers: dict[str, str], body: bytes) -> BillingWebhookEvent: ...

    def get_subscription(self, *, provider_subscription_id: str) -> ProviderSubscription: ...

    def cancel_subscription(
        self,
        *,
        provider_subscription_id: str,
        cancel_at_period_end: bool = True,
    ) -> ProviderSubscription: ...

    def map_provider_status_to_internal(self, raw_status: str) -> SubscriptionStatus: ...
