# Template Setup: BE NestJS

Template repository:
- `ImplementSprint/template-repo-be`

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
- Supabase values: Supabase Dashboard -> Project Settings -> API
- APICenter URL and tribe secret values: internal platform/API Center owners
- `ALLOWED_ORIGINS`: your frontend app URLs (comma-separated)

Security notes:
- Treat `SUPABASE_SERVICE_ROLE_KEY` and `APICENTER_TRIBE_SECRET` as high sensitivity.
- Store high-sensitivity values in secrets manager only.

## APICenter SDK Integration (required for Node/Nest callers)

Install and use the shared SDK package from GitHub Packages instead of raw HTTP calls to gateway routes.

Configure `.npmrc` in the caller repository first:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

```bash
npm install @implementsprint/sdk
```

The SDK source of truth is the `api-shared-services` repository. Commit the `.npmrc` placeholder, but never commit a literal token value. GitHub Actions supplies `${GITHUB_TOKEN}` during dependency installation. Dockerfiles that run `npm ci` for this package should consume the same token as a BuildKit secret named `GITHUB_TOKEN`; `docker-build.yml` passes that secret automatically.

## GitHub Repository Variables (Canonical)

Set in: Settings -> Secrets and variables -> Actions -> Variables

Required:
- `BACKEND_MULTI_SYSTEMS_JSON`

Recommended value:
```json
[
  {
    "name": "backend-api",
    "dir": ".",
    "install_dir": ".",
    "project": "api",
    "image": "backend-api",
    "backend_stack": "nestjs",
    "version_stream": "api",
    "test_command": "npm run test:cov -- --selectProjects api",
    "dockerfile_path": "apps/api/Dockerfile",
    "k6_script_path": "tests/performance/api-smoke.js"
  },
  {
    "name": "backend-location-service",
    "dir": ".",
    "install_dir": ".",
    "project": "location-service",
    "image": "backend-location-service",
    "backend_stack": "nestjs",
    "version_stream": "location-service",
    "test_command": "npm run test:cov -- --selectProjects location-service",
    "dockerfile_path": "apps/location-service/Dockerfile",
    "k6_script_path": "tests/performance/location-service-smoke.js"
  }
]
```

How to fill each field:
- `name`: stable service label for reports/notifications.
- `dir`: Docker build context; use `.` for NestJS monorepo services that share one package lock.
- `install_dir`: directory where `npm ci` and test commands run; use `.` for NestJS monorepos.
- `project`: Nest workspace project name.
- `image`: optional GHCR image name; the workflow prefixes `ghcr.io/<org>/`. If omitted, it defaults to `name`.
- `backend_stack`: fixed value `nestjs` for this template.
- `version_stream`: independent tag stream for each deployable service.
- `test_command`: service-specific test command.
- `dockerfile_path`: Dockerfile path relative to `dir`.
- `k6_script_path`: service-specific smoke script.

NestJS backend templates are monorepo workspaces by default. Use `BACKEND_MULTI_SYSTEMS_JSON` with one entry per deployable Nest app. The central workflow installs from `install_dir`, tests with `test_command`, builds containers from `dockerfile_path`, passes `GITHUB_TOKEN` to Docker BuildKit as a secret for private package installs, and versions each service through `version_stream`.

### Render Blueprint Setup

1. Add `BACKEND_MULTI_SYSTEMS_JSON` with one entry per deployable app.
2. Add `render.yaml` with one Render service per deployable app.
3. Create Render environment groups for test, uat, and production.
4. Put runtime secrets in Render environment groups, not in GitHub Actions.
5. Connect the repo as a Render Blueprint once per environment.
6. Run central workflow validation before enabling Render auto-sync.

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
- `SONAR_TOKEN`: SonarCloud -> My Account -> Security
- `SONAR_ORGANIZATION`: SonarCloud org settings
- `SONAR_PROJECT_KEY`: SonarCloud project settings
- `K6_CLOUD_TOKEN`: Grafana Cloud k6 token page
- `K6_CLOUD_PROJECT_ID`: Grafana Cloud k6 project page
- `GH_PR_TOKEN`: GitHub PAT with PR/contents write permissions

## First Run Checklist

1. Create `.env` from `.env.example`.
2. Add required repository variable.
3. Add required secrets.
4. Push to `test`.
5. Confirm quality gates, Sonar, and k6 all pass.

## Common Failure Modes

- Missing Supabase values -> service starts with dependency errors.
- Invalid `backend_stack` value -> orchestrator route mismatch.
- Missing `install_dir` in a monorepo system -> workflow falls back to `dir`, which can break if `dir` points at an app folder without `package-lock.json`.
- Missing `dockerfile_path` in a monorepo system -> Docker build looks for a root `Dockerfile` instead of the service Dockerfile.
- Missing Sonar secrets with Sonar enabled -> preflight/scan failures.
- Missing k6 secrets with k6 enabled -> k6 lane fails.
