# Template Setup: BE Node.js (Express)

Template repository:
- `ImplementSprint/template-repo-be-node`

Current caller workflow ref (documented exactly):
- `ImplementSprint/central-workflow/.github/workflows/master-pipeline-be.yml@main`

## Required Branches

Create:
- `test`
- `uat`
- `main`

## Local Development Setup

Prerequisites:
- Node.js 22+
- npm

Commands:
```bash
npm install
npm run start:dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Local Environment Variables

Create `.env` from `.env.example`.

Required:
- `NODE_ENV`
- `PORT`
- `ENABLE_SWAGGER`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

Optional:
- `APICENTER_URL` (or `API_CENTER_BASE_URL` for legacy compatibility)
- `APICENTER_TRIBE_ID` (recommended explicit service ID)
- `APICENTER_TRIBE_SECRET` (or service-specific secret name such as `PAYMENT_SERVICE_SECRET`)

Where to get values:
- Supabase: Project Settings -> API
- APICenter URL and tribe secret values: internal platform/API Center owners

Security notes:
- Treat `SUPABASE_SERVICE_ROLE_KEY` and `APICENTER_TRIBE_SECRET` as high sensitivity.

## APICenter SDK Integration (required for Node callers)

Install and use the shared SDK package from GitHub Packages instead of direct HTTP calls to APICenter routes.

Configure `.npmrc` in the caller repository first:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

```bash
npm install @implementsprint/sdk
```

The SDK source of truth is the `api-shared-services` repository. Commit the `.npmrc` placeholder, but never commit a literal token value. GitHub Actions supplies `${GITHUB_TOKEN}` during dependency installation.

## GitHub Repository Variables (Canonical)

Set in: Settings -> Secrets and variables -> Actions -> Variables

Required (single-system or multi-system model):
- `BACKEND_SINGLE_SYSTEMS_JSON` or `BACKEND_MULTI_SYSTEMS_JSON`

Single-system recommended value:
```json
{
  "name": "backend-node",
  "dir": ".",
  "image": "ghcr.io/org/backend-node",
  "backend_stack": "nodejs"
}
```

How to fill each field:
- `name`: stable service label for pipeline output.
- `dir`: repository-relative service directory.
- `image`: target GHCR image path (`ghcr.io/<org>/<image>`).
- `backend_stack`: fixed value `nodejs` for this template.

## GitHub Repository Secrets

Set in: Settings -> Secrets and variables -> Actions -> Secrets

Required with default workflow settings:
- `SONAR_TOKEN`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`
- `K6_CLOUD_TOKEN`
- `K6_CLOUD_PROJECT_ID`

Required if the repository installs `@implementsprint/sdk`:
- The GitHub package must grant this repository access, or the workflow `GITHUB_TOKEN` will still receive `401 Unauthorized`.

Recommended:
- `GH_PR_TOKEN`

Where to get each value:
- SonarCloud settings and account security
- Grafana Cloud k6 project settings
- GitHub PAT settings

## First Run Checklist

1. Create `.env` and populate required values.
2. Set backend systems variable.
3. Add required secrets.
4. Push to `test`.
5. Verify docker/sonar/k6 lanes.

## Common Failure Modes

- `backend_stack` not set to `nodejs` -> wrong backend lane behavior.
- Missing Sonar or k6 secrets with defaults enabled -> pipeline gate failures.
- Misconfigured image name -> container push/tagging failures.
