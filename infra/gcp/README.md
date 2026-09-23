# LinguaClass — Google Cloud Platform & CI/CD Operations Guide

This guide details how to deploy, manage, and scale **LinguaClass** on **Google Cloud Platform (GCP)** using **Cloud Run**, **Cloud SQL (PostgreSQL)**, **Cloud Storage**, **Vertex AI (Gemini)**, and **GitHub Actions**.

---

## 1. Architecture Overview

```
                         ┌──────────────────────┐
                         │      GitHub          │
                         │  linguaclass repo    │
                         └──────────┬───────────┘
                                    │
                              CI/CD deploy
                      (Workload Identity Federation)
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Google Cloud     │
                         │                      │
                         │      Cloud Run       │
                         │   Next.js Standalone │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
        Cloud SQL             Cloud Storage          Vertex AI
       PostgreSQL             Files/Media             Gemini
              │                     │                     │
              │                     │                     │
              └──────────────┬──────┴─────────────────────┘
                             ▼
                      External Services
                     ┌─────────────────┐
                     │ Supabase Auth   │
                     │ LiveKit Video   │
                     │ Stripe Payments │
                     │ Resend Email    │
                     └─────────────────┘
```

---

## 2. Prerequisites & CLI Setup

1. Install Google Cloud SDK (`gcloud`)
2. Authenticate locally:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```
3. Set your active project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## 3. Automated GCP Infrastructure Setup

Run the automated provisioning script for Staging and Production:

```bash
# Provision Staging environment
ENVIRONMENT=staging \
GCP_PROJECT_ID="your-project-id" \
GITHUB_REPO="your-org/linguaclass" \
./infra/gcp/setup.sh

# Provision Production environment
ENVIRONMENT=production \
GCP_PROJECT_ID="your-project-id" \
GITHUB_REPO="your-org/linguaclass" \
./infra/gcp/setup.sh
```

This script automatically:
- Enables all required Google Cloud APIs (`run`, `artifactregistry`, `sqladmin`, `storage`, `aiplatform`, `secretmanager`, `iam`).
- Creates the Artifact Registry repository (`linguaclass-docker`).
- Provisions Google Cloud Storage buckets (`linguaclass-staging-media`, `linguaclass-prod-media`) with CORS headers.
- Configures IAM service accounts with least-privilege security.
- Configures **Workload Identity Federation (WIF)** for GitHub Actions (no long-lived service account keys).

---

## 4. Secret Manager Configuration

Store your secrets in Google Secret Manager:

```bash
# Database connection string (Cloud SQL / Supabase)
echo -n "postgresql://..." | gcloud secrets create PROD_DATABASE_URL --data-file=-
echo -n "postgresql://..." | gcloud secrets create PROD_DIRECT_URL --data-file=-

# Supabase Auth Secrets
echo -n "sb_secret_..." | gcloud secrets create PROD_SUPABASE_SECRET_KEY --data-file=-

# LiveKit Video Secrets
echo -n "your-livekit-key" | gcloud secrets create PROD_LIVEKIT_API_KEY --data-file=-
echo -n "your-livekit-secret" | gcloud secrets create PROD_LIVEKIT_API_SECRET --data-file=-
```

---

## 5. GitHub Repository Secrets & Variables

In your GitHub repository settings (**Settings** > **Secrets and variables** > **Actions**), configure:

### Repository Secrets:
- `GCP_PROJECT_ID`: Your GCP project ID.
- `GCP_WIF_PROVIDER`: Full resource path output from `setup.sh` (e.g. `projects/12345/locations/global/workloadIdentityPools/linguaclass-production-pool/providers/linguaclass-github`).
- `GCP_WIF_SERVICE_ACCOUNT`: CI service account email (e.g. `linguaclass-production-ci-sa@PROJECT_ID.iam.gserviceaccount.com`).
- `STAGING_DATABASE_URL` / `PROD_DATABASE_URL`
- `STAGING_DIRECT_URL` / `PROD_DIRECT_URL`
- `STAGING_SUPABASE_SECRET_KEY` / `PROD_SUPABASE_SECRET_KEY`
- `STAGING_LIVEKIT_API_SECRET` / `PROD_LIVEKIT_API_SECRET`

### Repository Variables:
- `STAGING_NEXT_PUBLIC_SUPABASE_URL` / `PROD_NEXT_PUBLIC_SUPABASE_URL`
- `STAGING_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `PROD_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `STAGING_NEXT_PUBLIC_LIVEKIT_URL` / `PROD_NEXT_PUBLIC_LIVEKIT_URL`

---

## 6. Multi-Environment CI/CD Pipelines

- **Pull Requests / Feature Branches**: Trigger `.github/workflows/ci.yml` (ESLint, Typecheck, Build check).
- **Push to `develop` / `staging`**: Trigger `.github/workflows/deploy-staging.yml` -> builds container, runs Prisma migrations, deploys revision to `linguaclass-staging-web`.
- **Push / Release on `main`**: Trigger `.github/workflows/deploy-production.yml` -> deploys to `linguaclass-prod-web` with concurrency: 80, CPU: 2, RAM: 2Gi, min instances: 1 (zero cold starts).

---

## 7. Cloud Run Performance & Health Checks

- **Container Health Check Probe**: `/api/health` queries database connectivity and returns HTTP 200/503.
- **Standalone Tracing**: Monorepo root output tracing generates minimal Docker image sizes (~120MB).
- **Vertex AI Gemini**: Connects directly via ambient Application Default Credentials (ADC) on Cloud Run without extra key files.
