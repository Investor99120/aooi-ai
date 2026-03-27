from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.subscription import Subscription as SubscriptionRow


class SubscriptionRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_user(self, user_id: str) -> SubscriptionRow | None:
        return (
            self._db.query(SubscriptionRow)
            .filter(SubscriptionRow.user_id == user_id)
            .order_by(SubscriptionRow.id.desc())
            .first()
        )

    def upsert_from_provider(self, row: SubscriptionRow) -> SubscriptionRow:
        """TODO: merge on provider_subscription_id for idempotent webhook handling."""
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)
        return row
