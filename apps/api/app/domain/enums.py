from enum import StrEnum


class SubscriptionStatus(StrEnum):
    """Unified status — front-end and entitlements use this, not raw Stripe/Creem."""

    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    INCOMPLETE = "incomplete"


class PaymentProviderName(StrEnum):
    STRIPE = "stripe"
    CREEM = "creem"


class PlanCode(StrEnum):
    STARTER = "starter"
    PRO = "pro"
