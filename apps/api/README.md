# aooi.ai API (FastAPI)

Provider-agnostic billing layer: Stripe first, Creem later. Run locally:

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Configure via environment variables (see `app/core/config.py`). The Next.js app in the repo root should call this API for checkout, webhooks (or webhooks hit this service directly), and subscription reads.
