"""
Placeholder for Creem. When adding Creem:

- Implement PaymentProviderAdapter methods using Creem SDK/HTTP API.
- Add a Creem webhook route that parses into BillingWebhookEvent and reuses BillingWebhookHandler.
"""

from app.adapters.payment.base import (
    BillingWebhookEvent,
    CheckoutSessionResult,
    ProviderSubscription,
)
from app.domain.enums import PaymentProviderName, PlanCode, SubscriptionStatus


class CreemAdapter:
    name = PaymentProviderName.CREEM

    def create_checkout_session(
        self,
        *,
        user_id: str,
        plan_code: PlanCode,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSessionResult:
        raise NotImplementedError("Creem checkout — implement when provider is chosen.")

    def parse_webhook(self, *, headers: dict[str, str], body: bytes) -> BillingWebhookEvent:
        raise NotImplementedError("Creem webhook parse — implement with provider docs.")

    def get_subscription(self, *, provider_subscription_id: str) -> ProviderSubscription:
        raise NotImplementedError

    def cancel_subscription(
        self,
        *,
        provider_subscription_id: str,
        cancel_at_period_end: bool = True,
    ) -> ProviderSubscription:
        raise NotImplementedError

    def map_provider_status_to_internal(self, raw_status: str) -> SubscriptionStatus:
        return SubscriptionStatus.INCOMPLETE
