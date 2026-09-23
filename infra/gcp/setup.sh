#!/usr/bin/env bash
# =============================================================================
# LinguaClass — Google Cloud Platform Automated Provisioning Script
# Target Architecture: Cloud Run + Cloud SQL + GCS + Vertex AI + Secrets + WIF
# =============================================================================

set -euo pipefail

# Configuration defaults (Override via environment variables)
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${GCP_REGION:-europe-west1}"
ENVIRONMENT="${ENVIRONMENT:-production}" # staging | production
GITHUB_REPO="${GITHUB_REPO:-oluwasegun/linguaclass}" # format: owner/repo

GAR_REPO="linguaclass-docker"
GCS_BUCKET="linguaclass-${ENVIRONMENT}-media"
SERVICE_ACCOUNT_RUN="linguaclass-${ENVIRONMENT}-run-sa"
SERVICE_ACCOUNT_CI="linguaclass-${ENVIRONMENT}-ci-sa"
WIF_POOL="linguaclass-${ENVIRONMENT}-pool"
WIF_PROVIDER="linguaclass-github"

echo "================================================================="
echo " LinguaClass GCP Infrastructure Setup"
echo " Project ID   : ${PROJECT_ID}"
echo " Region       : ${REGION}"
echo " Environment  : ${ENVIRONMENT}"
echo " GitHub Repo  : ${GITHUB_REPO}"
echo "================================================================="

# 1. Enable Required GCP APIs
echo "--> 1. Enabling Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudbuild.googleapis.com \
  --project="${PROJECT_ID}"

# 2. Create Artifact Registry Docker Repository
echo "--> 2. Setting up Google Artifact Registry..."
if ! gcloud artifacts repositories describe "${GAR_REPO}" --location="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${GAR_REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker repository for LinguaClass applications" \
    --project="${PROJECT_ID}"
  echo "Created Artifact Registry repository: ${GAR_REPO}"
else
  echo "Artifact Registry repository already exists: ${GAR_REPO}"
fi

# 3. Create Cloud Storage Bucket for Media & Attachments
echo "--> 3. Creating Google Cloud Storage bucket..."
if ! gcloud storage buckets describe "gs://${GCS_BUCKET}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://${GCS_BUCKET}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --uniform-bucket-level-access \
    --public-access-prevention
  echo "Created GCS bucket: gs://${GCS_BUCKET}"

  # Set CORS configuration for direct browser uploads (signed URLs)
  cat <<EOF > /tmp/gcs-cors.json
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "ETag"],
    "maxAgeSeconds": 3600
  }
]
EOF
  gcloud storage buckets update "gs://${GCS_BUCKET}" --cors-file=/tmp/gcs-cors.json
  rm -f /tmp/gcs-cors.json
else
  echo "GCS bucket already exists: gs://${GCS_BUCKET}"
fi

# 4. Create Cloud Run Runtime Service Account
echo "--> 4. Configuring Cloud Run Runtime Service Account..."
RUN_SA_EMAIL="${SERVICE_ACCOUNT_RUN}@${PROJECT_ID}.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "${RUN_SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_RUN}" \
    --display-name="LinguaClass Cloud Run Runtime SA (${ENVIRONMENT})" \
    --project="${PROJECT_ID}"
fi

# Grant Cloud Run Runtime roles
echo "Assigning IAM roles to Cloud Run runtime SA..."
ROLES=(
  "roles/secretmanager.secretAccessor"
  "roles/storage.objectAdmin"
  "roles/aiplatform.user"
  "roles/cloudsql.client"
)
for role in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${RUN_SA_EMAIL}" \
    --role="${role}" \
    --condition=None --quiet
done

# 5. Create CI/CD Service Account & Workload Identity Federation
echo "--> 5. Configuring Workload Identity Federation (WIF) for GitHub Actions..."
CI_SA_EMAIL="${SERVICE_ACCOUNT_CI}@${PROJECT_ID}.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "${CI_SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_CI}" \
    --display-name="LinguaClass GitHub CI/CD SA (${ENVIRONMENT})" \
    --project="${PROJECT_ID}"
fi

# Grant CI/CD roles
CI_ROLES=(
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
  "roles/artifactregistry.writer"
)
for role in "${CI_ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${CI_SA_EMAIL}" \
    --role="${role}" \
    --condition=None --quiet
done

# Create Workload Identity Pool
if ! gcloud iam workload-identity-pools describe "${WIF_POOL}" --location="global" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "${WIF_POOL}" \
    --location="global" \
    --display-name="GitHub Actions Pool (${ENVIRONMENT})" \
    --project="${PROJECT_ID}"
fi

# Create Workload Identity Provider
if ! gcloud iam workload-identity-pools providers describe "${WIF_PROVIDER}" \
    --workload-identity-pool="${WIF_POOL}" \
    --location="global" \
    --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "${WIF_PROVIDER}" \
    --location="global" \
    --workload-identity-pool="${WIF_POOL}" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository == '${GITHUB_REPO}'" \
    --project="${PROJECT_ID}"
fi

# Allow GitHub Actions to impersonate CI Service Account
POOL_RESOURCE="principalSet://iam.googleapis.com/projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/${WIF_POOL}/attribute.repository/${GITHUB_REPO}"

gcloud iam service-accounts add-iam-policy-binding "${CI_SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="${POOL_RESOURCE}" \
  --quiet

PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
WIF_PROVIDER_FULL="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL}/providers/${WIF_PROVIDER}"

echo "================================================================="
echo " SETUP COMPLETED SUCCESSFULLY!"
echo "================================================================="
echo "Copy the following values into your GitHub Repository Secrets:"
echo ""
echo "GCP_PROJECT_ID            : ${PROJECT_ID}"
echo "GCP_WIF_PROVIDER          : ${WIF_PROVIDER_FULL}"
echo "GCP_WIF_SERVICE_ACCOUNT   : ${CI_SA_EMAIL}"
echo "================================================================="
