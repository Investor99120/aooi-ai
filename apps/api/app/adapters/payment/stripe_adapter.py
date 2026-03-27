"""
Stripe implementation of PaymentProviderAdapter.

TODO: Install `stripe`, verify webhook signatures, map subscription objects to ProviderSubscription.
Keep all Stripe SDK calls inside this module.
"""

from __future__ import annotations

from app.adapters.payment.base import (
    BillingWebhookEvent,
    CheckoutSessionResult,
    ProviderSubscription,
)
from app.domain.enums import PaymentProviderName, PlanCode, SubscriptionStatus


class StripeAdapter:
    name = PaymentProviderName.STRIPE

    def create_checkout_session(
        self,
        *,
        user_id: str,
        plan_code: PlanCode,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSessionResult:
        raise NotImplementedError(
            "TODO: stripe.checkout.Session.create with price IDs from plan_code; "
            "metadata user_id for reconciliation."
        )

    def parse_webhook(self, *, headers: dict[str, str], body: bytes) -> BillingWebhookEvent:
        raise NotImplementedError(
            "TODO: stripe.Webhook.construct_event + map to BillingWebhookEvent."
        )

    def get_subscription(self, *, provider_subscription_id: str) -> ProviderSubscription:
        raise NotImplementedError("TODO: stripe.Subscription.retrieve(...)")

    def cancel_subscription(
        self,
        *,
        provider_subscription_id: str,
        cancel_at_period_end: bool = True,
    ) -> ProviderSubscription:
        raise NotImplementedError("TODO: stripe.Subscription.modify(...)")

    def map_provider_status_to_internal(self, raw_status: str) -> SubscriptionStatus:
        mapping = {
            "trialing": SubscriptionStatus.TRIALING,
            "active": SubscriptionStatus.ACTIVE,
            "past_due": SubscriptionStatus.PAST_DUE,
            "canceled": SubscriptionStatus.CANCELED,
            "unpaid": SubscriptionStatus.UNPAID,
            "incomplete": SubscriptionStatus.INCOMPLETE,
            "incomplete_expired": SubscriptionStatus.INCOMPLETE,
        }
        return mapping.get(raw_status, SubscriptionStatus.INCOMPLETE)
