from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.payment_event import PaymentEvent


class PaymentEventRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def exists(self, provider: str, provider_event_id: str) -> bool:
        return (
            self._db.query(PaymentEvent)
            .filter(
                PaymentEvent.provider == provider,
                PaymentEvent.provider_event_id == provider_event_id,
            )
            .first()
            is not None
        )

    def record(
        self,
        *,
        provider: str,
        provider_event_id: str,
        event_type: str,
        payload: dict,
    ) -> PaymentEvent:
        row = PaymentEvent(
            provider=provider,
            provider_event_id=provider_event_id,
            event_type=event_type,
            payload=payload,
            received_at=datetime.now(timezone.utc),
        )
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)
        return row
