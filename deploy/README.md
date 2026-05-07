# ShortFlix — Deployment Runbook

This directory contains all infrastructure-as-code for the 8-service Cloud Run topology.

## Topology

| Service | Stack | Port | Min/Max instances | Ingress |
|---|---|---|---|---|
| `shortflix-web` | Next.js 14 PWA | 3000 | 1 / 10 | public |
| `shortflix-api` | NestJS gateway | 3001 | 0 / 10 | public |
| `shortflix-orchestrator` | Python ADK | 8081 | 1 / 5 | internal+LB |
| `shortflix-curator` | Python ADK | 8082 | 0 / 5 | internal |
| `shortflix-search` | Python ADK | 8083 | 0 / 5 | internal |
| `shortflix-trend-safety` | Python ADK | 8084 | 0 / 5 | internal |
| `shortflix-mcp-yt` | Node 22 MCP | 8090 | 0 / 5 | internal |
| `shortflix-mcp-ig` | Node 22 MCP | 8091 | 0 / 5 | internal |
| `shortflix-mcp-tt` | Node 22 MCP | 8092 | 0 / 5 | internal |

## One-time setup (manual, by project owner)

The following must be done by a human with `roles/owner` on the GCP project:

1. **Create the GCP project** named `shortflix` and request the $500 hackathon credit.
2. **Enable APIs**:
   ```
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
     artifactregistry.googleapis.com secretmanager.googleapis.com \
     aiplatform.googleapis.com firestore.googleapis.com \
     cloudscheduler.googleapis.com vpcaccess.googleapis.com \
     iamcredentials.googleapis.com cloudtrace.googleapis.com \
     --project shortflix
   ```
3. **Create Artifact Registry repo**:
   ```
   gcloud artifacts repositories create shortflix-images \
     --repository-format=docker --location=asia-northeast3 --project shortflix
   ```
4. **Create Firestore database** (Native mode, region `asia-northeast3`).
5. **Create the 9 service accounts** described in `deploy/iam.yaml` and bind their roles.
6. **Populate Secret Manager** with the secrets listed in `deploy/iam.yaml`:
   - `JWT_SIGNING_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
   - `RAPIDAPI_KEY_YT`, `RAPIDAPI_KEY_IG`, `RAPIDAPI_KEY_TT`
7. **Create Serverless VPC Connector** `shortflix-egress` in `asia-northeast3` with a static-IP NAT route — enables MCP egress allowlist (MD-03).
8. **Configure Workload Identity Federation** for GitHub Actions and store as repo secrets:
   - `GCP_WIF_PROVIDER`
   - `GCP_DEPLOYER_SA` (= `sa-cloudbuild-deployer@shortflix.iam.gserviceaccount.com`)
   - `NEXT_PUBLIC_API_BASE_URL` (final API URL after first deploy)

## Deploy flow

`git push origin main` triggers `.github/workflows/cd.yml`:
1. Verify spec lock SHA-256 (`specs/openapi.lock.txt`).
2. Run `scripts/assert-llm-endpoints.sh` (MD-03 R2 guard).
3. Authenticate via WIF.
4. `gcloud builds submit --config=deploy/cloudbuild.yaml` — builds 9 images in parallel, then runs `gcloud run services replace` for each.
5. Smoke-test public services' `/api/health`.

## Local development

Cloud Run is for deployment only. Locally each app runs directly:
```
# Terminal 1 — API
cd apps/api && pnpm install && pnpm start:dev

# Terminal 2 — Web
cd apps/web && pnpm install && pnpm dev

# Terminal 3+ — agents (skeleton only until ADK code lands)
cd agents/orchestrator && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python main.py
```

## Cost discipline (per MD-07)

Estimated monthly Cloud Run cost at **1000 DAU** with current sizing:

| Service | Sizing | Always-on hours | Est. $/mo |
|---|---|---|---|
| shortflix-web | 1 vCPU · 512Mi · min=1 | 730 | $13.50 |
| shortflix-orchestrator | 2 vCPU · 1Gi · min=1 | 730 | $33.50 |
| shortflix-api | 1 vCPU · 512Mi · min=0 | ~120 (active req-time) | $2.50 |
| shortflix-curator | 1 vCPU · 1Gi · min=0 | ~30 (nightly + on-demand) | $1.20 |
| shortflix-search | 1 vCPU · 512Mi · min=0 | ~40 | $1.00 |
| shortflix-trend-safety | 1 vCPU · 1Gi · min=0 | ~20 | $0.80 |
| shortflix-mcp-{yt,ig,tt} × 3 | 1 vCPU · 512Mi · min=0 | ~30 each | $2.20 |
| Firestore (reads/writes 1000 DAU × 50 ops) | — | — | $4.00 |
| Vertex AI Gemini 2.5 Flash | 1000 DAU × 5 calls × ~2k tokens | — | ~$15.00 |
| RapidAPI (3 platforms) | shared free/basic tiers | — | $30.00 |
| Cloud Scheduler + Build + Logging | — | — | <$3.00 |
| **Estimated total** | | | **~$107/mo** |

This sits slightly above the $100/mo target. Levers if needed:
- Drop `shortflix-orchestrator` `minScale` to 0 (saves ~$33; adds ~2s cold start).
- Switch `shortflix-web` to `cpu-throttling=true` outside requests (saves ~$8).
- Cap Vertex AI usage with quota.

With both web and orchestrator scale-to-zero (acceptable post-demo), monthly cost falls to **~$60/mo**, comfortably supporting the BP30% revenue claim.

## Verification checklist (run before submission)

```
# 1. Lock integrity
shasum -a 256 -c specs/openapi.lock.txt

# 2. LLM endpoint guard
bash scripts/assert-llm-endpoints.sh

# 3. Lighthouse PWA threshold (after deploy)
TARGET_URL=https://shortflix-web-... bash scripts/lighthouse-pwa.sh

# 4. List Cloud Run services (expect 9 — wait, 8 services + IAM doesn't deploy)
gcloud run services list --project shortflix --region asia-northeast3
```
