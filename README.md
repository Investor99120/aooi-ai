This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**aooi.ai** — subscription AI pet portrait SaaS (US/EU). Product milestones: **[docs/milestones-v1.md](./docs/milestones-v1.md)**.

## Monorepo layout

| Path | Role |
|------|------|
| Repo root (`app/`, `components/`, …) | **Next.js 16** web app (MVP). |
| `apps/api/` | **FastAPI** billing core — Stripe first, Creem-ready adapter layer (Batch 1 skeleton). |
| `messages/` | **next-intl** copy: `en` (default), `de`, `fr`, `es`. |
| `i18n/` | Routing + `request` config for next-intl. |
| `proxy.ts` | Locale negotiation + `/` → `/[locale]…` (Next.js “Proxy” convention). |

## Web — i18n

- Public URLs are prefixed: `/en`, `/de`, `/fr`, `/es` (e.g. `/en/pricing`).
- Visiting `/` redirects to the negotiated locale (cookie → `Accept-Language` → default `en`).
- Edit UI strings in `messages/*.json`; use `Link` / `useRouter` from `@/i18n/navigation` so the locale prefix is preserved.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should land on `/en` (or another locale).

## API (FastAPI)

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

See **[apps/api/README.md](./apps/api/README.md)**.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl](https://next-intl.dev/docs/getting-started/app-router)

## Deploy on Vercel

The easiest way to deploy the Next.js app is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Deploy the Python API separately (e.g. Railway, Fly, or a container).
