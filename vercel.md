# Deploying this site on Vercel

This guide walks through deploying **ai-vibe-coder-site** (Next.js App Router, pnpm, Digital Twin API) to [Vercel](https://vercel.com). It assumes the repo is on GitHub (for example `github.com/leroux1606/ai-vibe-coder-site`).

---

## 1. Prerequisites

- A **GitHub** (or GitLab / Bitbucket) account with this repository pushed.
- A **Vercel** account ([sign up](https://vercel.com/signup); “Continue with GitHub” is fastest).
- An **OpenRouter** account and API key for the Digital Twin chat ([OpenRouter keys](https://openrouter.ai/keys)).

---

## 2. Create a Vercel project

1. Log in at [vercel.com](https://vercel.com) and open the **Dashboard**.
2. Click **Add New… → Project**.
3. **Import** your Git repository (authorize Vercel for GitHub if prompted).
4. Vercel should detect **Next.js** automatically.

### Build settings (usually leave as detected)

| Setting          | Value                         |
| ---------------- | ----------------------------- |
| Framework Preset | Next.js                       |
| Root Directory   | `.` (repo root)               |
| Build Command    | `pnpm run build` (or default) |
| Output Directory | (leave default for Next.js)   |
| Install Command  | `pnpm install` (or default)   |

Vercel picks **pnpm** when it sees `pnpm-lock.yaml` in the repo.

5. **Do not** deploy yet—add environment variables in the next section, then click **Deploy**.

---

## 3. Environment variables (required for Digital Twin)

In the import screen, expand **Environment Variables**, or add them later under **Project → Settings → Environment Variables**.

### Required for production chat

| Name                   | Environments                                              | Notes                                      |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `OPENROUTER_API_KEY`   | Production (and Preview if you want chat on previews)   | Server-only. Never commit real keys to git |

### Strongly recommended

| Name       | Example                                                 | Notes                                                                 |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `SITE_URL` | `https://your-project.vercel.app` or your custom domain | OpenRouter `HTTP-Referer`, metadata, canonical URLs. Set after you know the live URL, then redeploy. |

Optional variables are listed in `.env.example` (model override, rate limits, `NEXT_PUBLIC_BASE_PATH` if you add `basePath` in `next.config`).

### Environment scopes

- **Production**: live site.
- **Preview**: PR and branch deployments—copy `OPENROUTER_API_KEY` here if the twin should work on previews (or omit to save quota).
- **Development**: used by `vercel dev` if you run it locally with linked env.

---

## 4. Node.js version

`package.json` specifies `"node": ">=18"`. Vercel defaults are usually fine.

To pin: **Project → Settings → General → Node.js Version** (for example **20.x**).

---

## 5. Serverless limits and streaming

The Digital Twin route uses Node and a long timeout:

- `export const runtime = "nodejs"` and `export const maxDuration = 120` in `app/api/digital-twin/chat/route.ts`.

On Vercel, **higher `maxDuration`** is tied to your **plan** (see [max duration](https://vercel.com/docs/functions/routing#max-duration)). If requests time out:

- Try a faster model via `DIGITAL_TWIN_MODEL`, or shorter conversations.
- Upgrade the plan or lower `maxDuration` to match your tier.

---

## 6. Rate limiting note

Limits are **in-memory per serverless instance**. With many instances, enforcement is best-effort. For strict production quotas, add a shared store (**Vercel KV**, **Upstash Redis**, etc.) and plug it into the rate-limit helper.

---

## 7. Deploy and verify

1. Click **Deploy** and wait for the build to finish.
2. Open the **Visit** URL.
3. Open **Digital Twin** and send a test message.
4. If something fails: **Deployments → [deployment] → Logs**, and function logs for `/api/digital-twin/chat`.

Common issues:

- **503 / key errors**: missing or wrong `OPENROUTER_API_KEY`, or variable only set for Production while you test a Preview URL.
- **HTML error in chat**: check function logs; confirm the deployment succeeded.
- **OpenRouter referer issues**: set `SITE_URL` to your real deployed origin.

---

## 8. Custom domain

1. **Project → Settings → Domains**.
2. Add the domain and apply the DNS records Vercel shows (often **CNAME** to `cname.vercel-dns.com`).
3. Set **`SITE_URL`** to `https://yourdomain.com` and redeploy.

---

## 9. Automatic deployments

- **Default production branch** (often `main` or `master`): each push triggers a **Production** deployment.
- **Pull requests**: unique **Preview** URLs.

Adjust under **Project → Settings → Git**.

---

## 10. Local parity with production

- Production uses **`next build`** / Vercel’s serverless runtime, not `pnpm dev`.
- `pnpm dev` runs `scripts/kill-port.mjs` first—**that script is not used on Vercel**; only install/build output matters.

Before pushing:

```bash
pnpm install
pnpm run lint
pnpm run build
pnpm test
```

---

## 11. Security checklist

- Keep secrets in **Vercel Environment Variables**, not in the repo (`.env.local` stays gitignored).
- Rotate **OpenRouter** keys if exposed.
- `dt_sid` is HttpOnly; optional hardening later: signed session cookies.

---

## 12. Quick reference

| Item              | Detail                                         |
| ----------------- | ---------------------------------------------- |
| Framework         | Next.js 16 (App Router)                        |
| Package manager   | pnpm                                           |
| API route         | `POST /api/digital-twin/chat`                  |
| Critical env vars | `OPENROUTER_API_KEY`, `SITE_URL` (recommended) |

More detail: [Vercel documentation](https://vercel.com/docs).
