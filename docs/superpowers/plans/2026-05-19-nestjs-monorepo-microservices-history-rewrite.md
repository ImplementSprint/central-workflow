# NestJS Monorepo Microservices History Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the backend template and tribe backend repositories from standalone NestJS apps into NestJS monorepo microservice workspaces, then rewrite the affected branch histories so the published branches present the corrected microservice architecture as the baseline.

**Architecture:** Each backend repository becomes a NestJS workspace with `apps/` for independently deployable runtimes and `libs/` for shared modules. The first baseline has an HTTP API app, a domain microservice app, and shared libraries for common bootstrap, API Center, Supabase, and contracts. The central backend pipeline must support monorepo service entries before any tribe branch is rewritten.

**Tech Stack:** NestJS 11, `@nestjs/microservices`, TypeScript 5, Node.js 22/24 CI, Jest, Docker, GitHub Actions, central-workflow backend reusable pipeline, Git force-push with lease.

---

## Current Checkout Evidence

This plan was written from `C:\Codes\secret-ops` on 2026-05-19.

Backend repositories found:

| Repo | Current branch | Remote branches seen | Current shape |
| --- | --- | --- | --- |
| `central-workflow` | `main` | `main`, `test`, feature branches | Shared workflow/docs repo |
| `template-repo-be-nest` | `test` | `main`, `test`, `uat` | Standalone Nest app |
| `campus-one-be` | `main` | `main`, `test`, `uat` | Standalone Nest app |
| `greenovate-be` | `main` | `main`, `test`, `uat` | Standalone Nest app |
| `paki-apps-be` | `main` | `main`, `test`, `uat` | Standalone Nest app |
| `sho-team-be` | `main` | `main`, `test`, `uat` | Standalone Nest app |
| `smurf-village-be` | `main` | `main`, `test`, `uat` | Standalone Nest app |
| `trini-thrive-be` | `main` | `main`, `test`, `uat`, `Develop`, `feat/hopecard-integration` | Standalone Nest app |

Shared findings:

- Every backend repo has `nest-cli.json` with `sourceRoot: "src"` and no `projects` object.
- Every backend repo has `src/` and no `apps/` or `libs/`.
- Every backend repo package is named `template-repo-be-single`.
- Every backend repo has `.github/workflows/be-pipeline-caller.yml`.
- Consumer caller workflows delegate to `ImplementSprint/central-workflow/.github/workflows/master-pipeline-be.yml@main`.
- The central backend pipeline already resolves `BACKEND_SINGLE_SYSTEMS_JSON` and `BACKEND_MULTI_SYSTEMS_JSON`, but its jobs currently treat each system `dir` as the install/build/test directory.
- `master-pipeline-be.yml` passes `matrix.service.dir` into backend tests, security, Docker, deploy, and k6 jobs.
- `backend-tests.yml` runs `npm ci --ignore-scripts` and `npm run test:cov` inside `inputs.working-directory`, so official Nest workspace monorepo support needs a central workflow adjustment before `apps/*` can be independent CI systems.

Official NestJS docs confirm the intended target shape:

- Nest monorepo mode uses `monorepo: true`, a root app under `apps/<app>`, and project metadata under `projects`.
- `nest start <name>` runs a specific workspace project.
- `nest generate app <name>` converts a standard project to monorepo mode and adds an app.
- `nest g library <name>` creates shared libraries under the workspace.
- Microservice entrypoints use `NestFactory.createMicroservice(...)`; hybrid apps use `app.connectMicroservice(...)` and `app.startAllMicroservices()`.

## Non-Negotiable Rules

- Do not force-push any branch until that repo has a local bundle backup.
- Do not rewrite protected or audited branches until branch protections and reviewers are intentionally paused.
- Do not rewrite public/shared history if the organization needs a visible audit trail. In that case, use a forward migration commit instead.
- Use `git push --force-with-lease`, not plain `git push --force`.
- Keep the old history in local backup bundles under `C:\Codes\secret-ops\history-backups\`.
- Run local verification before force-pushing, then run GitHub Actions in dry-run mode before enabling deploy/promotion.
- Freeze changes across all target repos while branch rewriting is active.

## Phase Overview

| Phase | Name | Main outcome | Exit gate |
| --- | --- | --- | --- |
| Phase 0 | Freeze, inventory, and backups | Every repo is frozen, fetched, inventoried, and backed up before changes begin | Bundle backups and branch inventory exist for every repo |
| Phase 1 | Central workflow enablement | `central-workflow` can run NestJS monorepo service matrices from one repo root | Workflow docs and validation pass locally or via dry-run |
| Phase 2 | Template monorepo conversion | `template-repo-be-nest` becomes the canonical NestJS monorepo/microservices template | Local lint, typecheck, build, tests, and Docker builds pass |
| Phase 3 | Tribe repo conversion | Each tribe backend matches the canonical template while preserving tribe identity | Every tribe repo passes local verification |
| Phase 4 | Published history rewrite | Branch tips are rewritten so `HEAD~1` is the microservices conversion and `HEAD` is follow-up fixes | `main`, `uat`, and `test` point to the curated two-commit history |
| Phase 5 | GitHub variables and CI dry runs | GitHub Actions resolves every backend as multi-service monorepo systems | Dry-run CI passes with deploy and promotion disabled |
| Phase 6 | Normal flow restoration | Branch protections, deploy mapping, and promotion flow are restored | `test -> uat -> main` promotion works on clean history |
| Phase 7 | Closeout | Repo state, CI, docs, and backups are checked against the plan | Final alignment checklist is complete |

Do not advance phases if the exit gate fails. Fix the current phase first, then rerun its verification.

## Target Repository Shape

Every backend repo should end with this baseline layout:

```text
.
  apps/
    api/
      src/
        main.ts
        api.module.ts
      tsconfig.app.json
      Dockerfile
    location-service/
      src/
        main.ts
        location-service.module.ts
      tsconfig.app.json
      Dockerfile
  libs/
    api-center/
      src/
        api-center-sdk.module.ts
        tribe-registration.service.ts
        index.ts
    common/
      src/
        config/
        filters/
        middleware/
        index.ts
    contracts/
      src/
        location.patterns.ts
        index.ts
    supabase/
      src/
        supabase.module.ts
        supabase.service.ts
        index.ts
  tests/
    e2e/
      api.e2e-spec.ts
    performance/
      api-smoke.js
      location-service-smoke.js
  package.json
  package-lock.json
  nest-cli.json
  tsconfig.json
  tsconfig.build.json
  Dockerfile
  tribe-manifest.json
```

The initial services are:

| Service | Runtime | Purpose |
| --- | --- | --- |
| `api` | HTTP Nest app | Public REST surface, health, Swagger, API Center registration, request correlation |
| `location-service` | Nest microservice app | Starter domain microservice moved from the current `src/location` module |

Future tribe-owned domains should add new `apps/<domain>-service` projects and shared contracts in `libs/contracts`.

## Canonical `nest-cli.json`

Use this shape in every backend repo after migration:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "monorepo": true,
  "root": "apps/api",
  "sourceRoot": "apps/api/src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "apps/api/tsconfig.app.json"
  },
  "projects": {
    "api": {
      "type": "application",
      "root": "apps/api",
      "entryFile": "main",
      "sourceRoot": "apps/api/src",
      "compilerOptions": {
        "tsConfigPath": "apps/api/tsconfig.app.json"
      }
    },
    "location-service": {
      "type": "application",
      "root": "apps/location-service",
      "entryFile": "main",
      "sourceRoot": "apps/location-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/location-service/tsconfig.app.json"
      }
    },
    "common": {
      "type": "library",
      "root": "libs/common",
      "entryFile": "index",
      "sourceRoot": "libs/common/src",
      "compilerOptions": {
        "tsConfigPath": "libs/common/tsconfig.lib.json"
      }
    },
    "api-center": {
      "type": "library",
      "root": "libs/api-center",
      "entryFile": "index",
      "sourceRoot": "libs/api-center/src",
      "compilerOptions": {
        "tsConfigPath": "libs/api-center/tsconfig.lib.json"
      }
    },
    "supabase": {
      "type": "library",
      "root": "libs/supabase",
      "entryFile": "index",
      "sourceRoot": "libs/supabase/src",
      "compilerOptions": {
        "tsConfigPath": "libs/supabase/tsconfig.lib.json"
      }
    },
    "contracts": {
      "type": "library",
      "root": "libs/contracts",
      "entryFile": "index",
      "sourceRoot": "libs/contracts/src",
      "compilerOptions": {
        "tsConfigPath": "libs/contracts/tsconfig.lib.json"
      }
    }
  }
}
```

## Canonical Package Scripts

Every migrated backend repo should replace the single-app scripts with:

```json
{
  "scripts": {
    "build": "nest build --all",
    "build:api": "nest build api",
    "build:location-service": "nest build location-service",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"apps/**/*.ts\" \"libs/**/*.ts\" \"tests/**/*.ts\"",
    "start": "nest start api",
    "start:dev": "nest start api --watch",
    "start:api": "nest start api",
    "start:api:dev": "nest start api --watch",
    "start:location-service": "nest start location-service",
    "start:location-service:dev": "nest start location-service --watch",
    "start:prod:api": "node dist/apps/api/main",
    "start:prod:location-service": "node dist/apps/location-service/main",
    "lint": "eslint \"{apps,libs,tests}/**/*.ts\"",
    "lint:fix": "eslint \"{apps,libs,tests}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:api": "jest --selectProjects api",
    "test:location-service": "jest --selectProjects location-service",
    "test:e2e": "jest --config ./tests/e2e/jest-e2e.json",
    "dummy:show": "node ./scripts/show-dummy-account.cjs"
  }
}
```

## Canonical Microservice Entrypoints

`apps/api/src/main.ts` keeps the current HTTP bootstrap, global prefix, validation, filters, CORS, Swagger, and health behavior. It may also connect the local microservice during local development:

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.LOCATION_SERVICE_HOST ?? '127.0.0.1',
      port: Number(process.env.LOCATION_SERVICE_PORT ?? 4010)
    }
  });

  await app.startAllMicroservices();
  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
```

`apps/location-service/src/main.ts` is a separate deployable Nest microservice:

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { LocationServiceModule } from './location-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LocationServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.LOCATION_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.LOCATION_SERVICE_PORT ?? 4010)
      }
    }
  );

  await app.listen();
}

void bootstrap();
```

## Canonical CI Systems JSON

After central-workflow supports monorepo service metadata, each backend repo should use `BACKEND_MULTI_SYSTEMS_JSON` and remove `BACKEND_SINGLE_SYSTEMS_JSON`.

Example for `template-repo-be-nest`:

```json
[
  {
    "name": "template-api",
    "dir": ".",
    "project": "api",
    "image": "ghcr.io/implementsprint/template-repo-be-nest-api",
    "backend_stack": "nestjs",
    "version_stream": "api",
    "test_command": "npm run test:cov -- --selectProjects api",
    "build_command": "npm run build:api",
    "dockerfile_path": "apps/api/Dockerfile",
    "k6_script_path": "tests/performance/api-smoke.js"
  },
  {
    "name": "template-location-service",
    "dir": ".",
    "project": "location-service",
    "image": "ghcr.io/implementsprint/template-repo-be-nest-location-service",
    "backend_stack": "nestjs",
    "version_stream": "location-service",
    "test_command": "npm run test:cov -- --selectProjects location-service",
    "build_command": "npm run build:location-service",
    "dockerfile_path": "apps/location-service/Dockerfile",
    "k6_script_path": "tests/performance/location-service-smoke.js"
  }
]
```

For a tribe repo, replace the `template-` prefix with the repo name:

| Repo | API image | Location image |
| --- | --- | --- |
| `campus-one-be` | `ghcr.io/implementsprint/campus-one-be-api` | `ghcr.io/implementsprint/campus-one-be-location-service` |
| `greenovate-be` | `ghcr.io/implementsprint/greenovate-be-api` | `ghcr.io/implementsprint/greenovate-be-location-service` |
| `paki-apps-be` | `ghcr.io/implementsprint/paki-apps-be-api` | `ghcr.io/implementsprint/paki-apps-be-location-service` |
| `sho-team-be` | `ghcr.io/implementsprint/sho-team-be-api` | `ghcr.io/implementsprint/sho-team-be-location-service` |
| `smurf-village-be` | `ghcr.io/implementsprint/smurf-village-be-api` | `ghcr.io/implementsprint/smurf-village-be-location-service` |
| `trini-thrive-be` | `ghcr.io/implementsprint/trini-thrive-be-api` | `ghcr.io/implementsprint/trini-thrive-be-location-service` |

## Phase 0: Freeze, Inventory, and Recovery Safety

### Task 1: Freeze, Inventory, and Back Up All Repositories

**Files:**
- Read: every repo `.git` state
- Create: `C:\Codes\secret-ops\history-backups\*.bundle`
- Create: `C:\Codes\secret-ops\history-backups\branch-inventory-2026-05-19.md`

- [ ] **Step 1: Announce freeze window**

Tell the team that `main`, `test`, and `uat` are frozen for:

```text
central-workflow
template-repo-be-nest
campus-one-be
greenovate-be
paki-apps-be
sho-team-be
smurf-village-be
trini-thrive-be
```

Include `trini-thrive-be` branches `Develop` and `feat/hopecard-integration` in the freeze because they exist remotely and may need preservation or rewrite.

- [ ] **Step 2: Create backup folder**

Run from `C:\Codes\secret-ops`:

```powershell
New-Item -ItemType Directory -Force -Path C:\Codes\secret-ops\history-backups
```

Expected: folder exists.

- [ ] **Step 3: Fetch all target refs**

Run inside each repo:

```powershell
git fetch --all --prune --tags
```

Expected: remote branch list is current.

- [ ] **Step 4: Bundle each repo before rewriting**

Run from `C:\Codes\secret-ops`:

```powershell
$repos = @(
  'central-workflow',
  'template-repo-be-nest',
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)

foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  git bundle create "C:\Codes\secret-ops\history-backups\$repo-before-nestjs-monorepo-2026-05-19.bundle" --all
  Pop-Location
}
```

Expected: one `.bundle` file per repo.

- [ ] **Step 5: Record current remote branch heads**

Run from `C:\Codes\secret-ops`:

```powershell
$repos = @(
  'central-workflow',
  'template-repo-be-nest',
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)

$out = @('# Branch Inventory - 2026-05-19', '')
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  $out += "## $repo"
  $out += ''
  $out += '```text'
  $out += git branch -r -v --no-abbrev
  $out += '```'
  $out += ''
  Pop-Location
}

$out | Set-Content -LiteralPath C:\Codes\secret-ops\history-backups\branch-inventory-2026-05-19.md
```

Expected: inventory file contains every remote branch and SHA before rewrite.

## Phase 1: Central Workflow Enablement

### Task 2: Update `central-workflow` for NestJS Monorepo Systems

**Files:**
- Modify: `central-workflow/.github/workflows/master-pipeline-be.yml`
- Modify: `central-workflow/.github/workflows/backend-tests.yml`
- Modify: `central-workflow/.github/workflows/docker-build.yml`
- Modify: `central-workflow/templates/be-pipeline-caller.yml`
- Modify: `central-workflow/docs/template-be-nest.md`
- Modify: `central-workflow/docs/template-callers.md`
- Modify: `central-workflow/docs/workflow-contract-registry.md`
- Test: `central-workflow/.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Add monorepo fields to backend system normalization**

In `master-pipeline-be.yml`, preserve and default these optional fields per backend system:

```yaml
project: (.project // .name),
install_dir: (.install_dir // .dir),
test_command: (.test_command // "npm run test:cov"),
build_command: (.build_command // "npm run build"),
dockerfile_path: (.dockerfile_path // "Dockerfile"),
k6_script_path: (.k6_script_path // ""),
k6_base_url: (.k6_base_url // ""),
k6_run_only_on_branch: (.k6_run_only_on_branch // "")
```

Expected: existing single-repo systems still work because every field has a default.

- [ ] **Step 2: Pass service-specific commands to backend tests**

Change the `backend-build` job call in `master-pipeline-be.yml` so each matrix service can override the command:

```yaml
with:
  working-directory: ${{ matrix.service.install_dir || matrix.service.dir }}
  system-name: ${{ matrix.service.name }}
  backend-stack: ${{ matrix.service.backend_stack }}
  test-command: ${{ matrix.service.test_command || 'npm run test:cov' }}
```

Expected: monorepo entries run tests from the repo root while selecting the intended Nest project.

- [ ] **Step 3: Pass service-specific Dockerfile paths**

Change the `docker-build-main` job call in `master-pipeline-be.yml`:

```yaml
with:
  working-directory: ${{ matrix.service.dir }}
  image-name: ${{ matrix.service.image }}
  dockerfile-path: ${{ matrix.service.dockerfile_path || 'Dockerfile' }}
  push-image: false
  scan-vulnerabilities: true
```

Expected: Docker builds can use `apps/api/Dockerfile` and `apps/location-service/Dockerfile`.

- [ ] **Step 4: Keep k6 path service-specific**

Keep this existing behavior and document it:

```yaml
script-path: ${{ matrix.service.k6_script_path || inputs.k6_script_path }}
target-base-url: ${{ matrix.service.k6_base_url || inputs.k6_base_url }}
run-only-on-branch: ${{ matrix.service.k6_run_only_on_branch || inputs.k6_run_only_on_branch }}
```

Expected: each service can have its own smoke script.

- [ ] **Step 5: Update backend caller template comments**

In `templates/be-pipeline-caller.yml`, replace the single-system example with:

```yaml
# Configure BACKEND_MULTI_SYSTEMS_JSON for NestJS monorepo backends.
# Example:
# [
#   {
#     "name":"backend-api",
#     "dir":".",
#     "install_dir":".",
#     "project":"api",
#     "image":"ghcr.io/org/backend-api",
#     "backend_stack":"nestjs",
#     "version_stream":"api",
#     "test_command":"npm run test:cov -- --selectProjects api",
#     "dockerfile_path":"apps/api/Dockerfile",
#     "k6_script_path":"tests/performance/api-smoke.js"
#   }
# ]
```

Expected: new template users see monorepo as the default backend shape.

- [ ] **Step 6: Update workflow docs**

Update `docs/template-be-nest.md`, `docs/template-callers.md`, and `docs/workflow-contract-registry.md` so backend Nest repos use `BACKEND_MULTI_SYSTEMS_JSON` by default.

Expected docs wording:

```text
NestJS backend templates are monorepo workspaces by default. Use BACKEND_MULTI_SYSTEMS_JSON with one entry per deployable Nest app. The central workflow installs from install_dir, tests with test_command, builds containers from dockerfile_path, and versions each service through version_stream.
```

- [ ] **Step 7: Validate central workflow**

Run from `central-workflow`:

```powershell
git diff --check
```

Expected: no whitespace errors.

Run:

```powershell
npm test -- --runInBand
```

Expected: workflow validation tests pass, or no npm test script exists and the validation must be performed through GitHub Actions `workflow_dispatch` dry run.

## Phase 2: Template Repository Conversion

### Task 3: Convert `template-repo-be-nest` to the Canonical Monorepo

**Files:**
- Modify: `template-repo-be-nest/package.json`
- Modify: `template-repo-be-nest/package-lock.json`
- Modify: `template-repo-be-nest/nest-cli.json`
- Modify: `template-repo-be-nest/tsconfig.json`
- Modify: `template-repo-be-nest/tsconfig.build.json`
- Move: `template-repo-be-nest/src/common` to `template-repo-be-nest/libs/common/src`
- Move: `template-repo-be-nest/src/api-center` to `template-repo-be-nest/libs/api-center/src`
- Move: `template-repo-be-nest/src/supabase` to `template-repo-be-nest/libs/supabase/src`
- Move: `template-repo-be-nest/src/location` to `template-repo-be-nest/apps/location-service/src`
- Move: `template-repo-be-nest/src/app*` and `template-repo-be-nest/src/main.ts` to `template-repo-be-nest/apps/api/src`
- Create: `template-repo-be-nest/libs/contracts/src/location.patterns.ts`
- Create: `template-repo-be-nest/apps/api/Dockerfile`
- Create: `template-repo-be-nest/apps/location-service/Dockerfile`
- Modify: `template-repo-be-nest/.github/workflows/be-pipeline-caller.yml`
- Modify: `template-repo-be-nest/README.md`
- Modify: `template-repo-be-nest/START_HERE_BACKEND.md`
- Modify: `template-repo-be-nest/TRIBE_API_INTEGRATION.md`

- [ ] **Step 1: Create monorepo folders**

Run from `template-repo-be-nest`:

```powershell
New-Item -ItemType Directory -Force -Path apps\api\src, apps\location-service\src, libs\common\src, libs\api-center\src, libs\supabase\src, libs\contracts\src
```

Expected: all app and lib folders exist.

- [ ] **Step 2: Move current modules into apps/libs**

Use PowerShell `Move-Item -LiteralPath` for exact paths:

```powershell
Move-Item -LiteralPath src\common\* -Destination libs\common\src
Move-Item -LiteralPath src\api-center\* -Destination libs\api-center\src
Move-Item -LiteralPath src\supabase\* -Destination libs\supabase\src
Move-Item -LiteralPath src\location\* -Destination apps\location-service\src
Move-Item -LiteralPath src\main.ts -Destination apps\api\src\main.ts
Move-Item -LiteralPath src\app.module.ts -Destination apps\api\src\api.module.ts
Move-Item -LiteralPath src\app.controller.ts -Destination apps\api\src\api.controller.ts
Move-Item -LiteralPath src\app.controller.spec.ts -Destination apps\api\src\api.controller.spec.ts
Move-Item -LiteralPath src\app.service.ts -Destination apps\api\src\api.service.ts
Move-Item -LiteralPath src\app.service.spec.ts -Destination apps\api\src\api.service.spec.ts
```

Expected: `src/` is empty or contains only files intentionally removed after verification.

- [ ] **Step 3: Add library index files**

Create:

```typescript
// libs/common/src/index.ts
export * from './config/env.validation';
export * from './config/security.config';
export * from './filters/all-exceptions.filter';
export * from './middleware/correlation-id.middleware';
```

```typescript
// libs/api-center/src/index.ts
export * from './api-center-sdk.module';
export * from './tribe-registration.service';
```

```typescript
// libs/supabase/src/index.ts
export * from './supabase.module';
export * from './supabase.service';
```

```typescript
// libs/contracts/src/location.patterns.ts
export const LOCATION_PATTERNS = {
  reverseGeocode: 'location.reverse-geocode',
  health: 'location.health'
} as const;
```

```typescript
// libs/contracts/src/index.ts
export * from './location.patterns';
```

- [ ] **Step 4: Update TypeScript paths**

In `tsconfig.json`, add:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/common": ["libs/common/src"],
      "@app/common/*": ["libs/common/src/*"],
      "@app/api-center": ["libs/api-center/src"],
      "@app/api-center/*": ["libs/api-center/src/*"],
      "@app/supabase": ["libs/supabase/src"],
      "@app/supabase/*": ["libs/supabase/src/*"],
      "@app/contracts": ["libs/contracts/src"],
      "@app/contracts/*": ["libs/contracts/src/*"]
    }
  }
}
```

Expected: app imports use `@app/...` paths, not fragile relative imports across `apps/` and `libs/`.

- [ ] **Step 5: Create app tsconfig files**

Create `apps/api/tsconfig.app.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/api"
  },
  "include": ["src/**/*.ts", "../../libs/**/*.ts"],
  "exclude": ["node_modules", "dist", "test", "tests", "**/*spec.ts"]
}
```

Create `apps/location-service/tsconfig.app.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/location-service"
  },
  "include": ["src/**/*.ts", "../../libs/**/*.ts"],
  "exclude": ["node_modules", "dist", "test", "tests", "**/*spec.ts"]
}
```

- [ ] **Step 6: Update root module imports**

In `apps/api/src/api.module.ts`, import shared modules from libs:

```typescript
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiCenterSdkModule } from '@app/api-center';
import { CorrelationIdMiddleware } from '@app/common';
import { SupabaseModule } from '@app/supabase';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
```

Expected: root API module compiles without imports from old `src/*` paths.

- [ ] **Step 7: Update location service module**

Create or rename `apps/location-service/src/location-service.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiCenterSdkModule } from '@app/api-center';
import { SupabaseModule } from '@app/supabase';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ApiCenterSdkModule, SupabaseModule],
  controllers: [LocationController],
  providers: [LocationService]
})
export class LocationServiceModule {}
```

Expected: location code becomes its own deployable Nest project.

- [ ] **Step 8: Add microservice package dependency**

Run from `template-repo-be-nest`:

```powershell
npm install @nestjs/microservices@^11.0.1
```

Expected: `package.json` and `package-lock.json` include `@nestjs/microservices`.

- [ ] **Step 9: Update Dockerfiles**

Create `apps/api/Dockerfile`:

```Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs
RUN npm run build:api

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN apk upgrade --no-cache zlib \
  && npm ci --omit=dev \
  && rm package-lock.json \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/v1/health', (res) => { if (res.statusCode !== 200) process.exit(1); }).on('error', () => process.exit(1));"
CMD ["node", "dist/apps/api/main"]
```

Create `apps/location-service/Dockerfile`:

```Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs
RUN npm run build:location-service

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN apk upgrade --no-cache zlib \
  && npm ci --omit=dev \
  && rm package-lock.json \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
USER nestjs
EXPOSE 4010
CMD ["node", "dist/apps/location-service/main"]
```

- [ ] **Step 10: Verify template locally**

Run from `template-repo-be-nest`:

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:cov
npm run test:e2e
docker build -f apps/api/Dockerfile -t template-repo-be-nest-api:local .
docker build -f apps/location-service/Dockerfile -t template-repo-be-nest-location-service:local .
```

Expected: all commands pass.

## Phase 3: Tribe Repository Conversion

### Task 4: Propagate Template Migration to Tribe Repositories

**Files:**
- Apply the same structural migration to:
  - `campus-one-be`
  - `greenovate-be`
  - `paki-apps-be`
  - `sho-team-be`
  - `smurf-village-be`
  - `trini-thrive-be`
- Preserve each repo's own `tribe-manifest.json`, `TRIBE_API_INTEGRATION.md`, service IDs, secrets documentation, and tribe-specific feature files.

- [ ] **Step 1: Diff each tribe against template before copying**

Run from `C:\Codes\secret-ops`:

```powershell
$tribes = @('campus-one-be','greenovate-be','paki-apps-be','sho-team-be','smurf-village-be','trini-thrive-be')
foreach ($repo in $tribes) {
  Write-Host "=== $repo ==="
  git -C $repo diff --no-index --stat ..\template-repo-be-nest\src src
}
```

Expected: tribe-specific differences are known before moving files.

- [ ] **Step 2: Apply the monorepo file move per repo**

Repeat Task 3 steps for each tribe repo. Use the template as the mechanical source, then restore tribe-specific names and manifest values.

Expected: every tribe repo has `apps/`, `libs/`, monorepo `nest-cli.json`, app Dockerfiles, and `BACKEND_MULTI_SYSTEMS_JSON` docs.

- [ ] **Step 3: Update image names per tribe**

Use the table in "Canonical CI Systems JSON" for GHCR image names.

Expected: no tribe repo still uses `template-repo-be-single` or `template-repo-be-nest` image names.

- [ ] **Step 4: Verify each tribe locally**

Run in every tribe repo:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
npm run test:cov
npm run test:e2e
docker build -f apps/api/Dockerfile -t local-api:latest .
docker build -f apps/location-service/Dockerfile -t local-location-service:latest .
```

Expected: all commands pass before any branch rewrite starts.

## Phase 4: Published History Rewrite

### Task 5: Rewrite Template and Tribe Branch Histories

**Files:**
- Git refs only in:
  - `template-repo-be-nest`
  - `campus-one-be`
  - `greenovate-be`
  - `paki-apps-be`
  - `sho-team-be`
  - `smurf-village-be`
  - `trini-thrive-be`

The branch rewrite target is that the published branches show the NestJS monorepo/microservices correction in the latest visible history instead of carrying the standalone-app mistake forward.

There are two supported rewrite modes:

| Mode | What the branch history looks like after rewrite | Use when |
| --- | --- | --- |
| Penultimate-fix cleanup | Older acceptable history remains, but the recent bad commits are replaced with two curated commits: the second latest commit is the real NestJS monorepo/microservices conversion, and the latest commit is a small fix/hardening commit | The goal is to make it look like the architecture was fixed in the second latest commit and the branch tip is only follow-up fixes |
| Clean baseline | The branch is replaced by one curated root commit containing the final monorepo microservices tree | The goal is to remove all visible standalone-backend history from the published branch |

Default to **Penultimate-fix cleanup** when the old branch history is mostly acceptable and only the recent backend-template work needs to be corrected. Use **Clean baseline** only when the published branch must not expose the old standalone shape at all.

### Mode A: Penultimate-Fix Cleanup

Use this mode to rewrite the latest bad commits into a clean two-commit sequence:

```text
HEAD~1  feat: convert backend to NestJS monorepo microservices
HEAD    fix: harden backend monorepo pipeline and runtime wiring
```

The important visual result is that the second latest commit contains the architecture correction, while the latest commit looks like normal follow-up fixes.

1. Find the last good commit before the standalone backend work.
2. Soft-reset to that commit so the final migrated tree remains staged as new work.
3. Recommit the final monorepo work as the second latest commit.
4. Recommit CI/doc/runtime polish as the latest commit.
5. Move `test`, `uat`, and `main` to the curated branch head.
6. Push with `--force-with-lease`.

Commands inside a verified migrated repo:

```powershell
git log --oneline --decorate --graph --all -n 40
```

Pick the SHA before the standalone-template commits. Then run:

```powershell
git checkout test
git reset --soft <last-good-sha>
git reset
git add package.json package-lock.json nest-cli.json tsconfig.json tsconfig.build.json apps libs tests/e2e Dockerfile tribe-manifest.json
git commit -m "feat: convert backend to NestJS monorepo microservices"
git add .github/workflows README.md START_HERE_BACKEND.md TRIBE_API_INTEGRATION.md tests/performance
git commit -m "fix: harden backend monorepo pipeline and runtime wiring"
```

If the final tree is already fully committed before the reset, use `git reset --soft <last-good-sha>` and then split the staged final tree into exactly these two commits. If some files need different commit grouping, use `git add -p` to stage only the intended files for each commit.

Commit ownership:

| Commit | Contains | Should not contain |
| --- | --- | --- |
| `feat: convert backend to NestJS monorepo microservices` | `apps/`, `libs/`, `nest-cli.json`, TypeScript paths, package scripts, microservice entrypoints, app/module moves | Follow-up typo fixes, CI-only polish, README wording-only changes |
| `fix: harden backend monorepo pipeline and runtime wiring` | workflow caller updates, Dockerfile corrections, k6 smoke paths, docs corrections, minor import/build/test fixes found during verification | Large architecture moves that belong in the previous commit |

After verification, align promotion branches:

```powershell
git branch -f uat test
git branch -f main test
git push --force-with-lease origin test
git push --force-with-lease origin uat
git push --force-with-lease origin main
```

Expected: GitHub shows the second latest commit as the monorepo/microservices correction and the latest commit as follow-up fixes. The previous standalone-template commits no longer appear on the published branch tips.

### Mode B: Clean Baseline

Use this mode when old standalone-backend history must disappear completely from the published branch. The safest clean pattern is:

1. Create one curated root commit containing the final monorepo microservices baseline.
2. Point `main`, `uat`, and `test` to that same baseline commit.
3. Resume future work from `test`.
4. Preserve old branch history only in local backup bundles.

- [ ] **Step 1: Confirm backup exists for the repo**

Run from `C:\Codes\secret-ops`:

```powershell
Test-Path C:\Codes\secret-ops\history-backups\template-repo-be-nest-before-nestjs-monorepo-2026-05-19.bundle
```

Expected: `True`. Repeat for each tribe repo before rewriting it.

- [ ] **Step 2: Create a clean orphan branch**

Run inside a verified migrated repo:

```powershell
git checkout --orphan microservices-baseline-2026-05-19
git add -A
git commit -m "chore: initialize NestJS microservices monorepo"
```

Expected: one root commit with the final monorepo tree.

- [ ] **Step 3: Run final verification on the orphan commit**

Run:

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:cov
npm run test:e2e
```

Expected: all checks pass on the exact commit that will become branch history.

- [ ] **Step 4: Move local promotion branches to the baseline**

Run:

```powershell
git branch -f main microservices-baseline-2026-05-19
git branch -f uat microservices-baseline-2026-05-19
git branch -f test microservices-baseline-2026-05-19
```

Expected: `main`, `uat`, and `test` point to the same baseline commit.

- [ ] **Step 5: Handle extra trini-thrive branches**

For `trini-thrive-be`, decide whether extra branches should preserve feature intent:

```powershell
git branch -f Develop microservices-baseline-2026-05-19
git branch -f feat/hopecard-integration microservices-baseline-2026-05-19
```

Expected: extra branches no longer expose the old standalone shape. If the hopecard feature has real unmerged code, re-apply it as a new clean commit after the baseline.

- [ ] **Step 6: Force-push with lease**

Run only after local verification passes and branch protections are temporarily configured for the rewrite:

```powershell
git push --force-with-lease origin main
git push --force-with-lease origin uat
git push --force-with-lease origin test
```

For `trini-thrive-be`, also run:

```powershell
git push --force-with-lease origin Develop
git push --force-with-lease origin feat/hopecard-integration
```

Expected: GitHub branch heads now point to the clean monorepo baseline commit.

- [ ] **Step 7: Re-enable branch protections**

Restore required checks, review rules, and deploy/promotion policies immediately after each repo rewrite.

Expected: future pushes cannot accidentally rewrite the branch again.

### Task 6: Rewrite or Forward-Fix `central-workflow`

**Files:**
- Git refs in `central-workflow`

Because `central-workflow` is shared infrastructure, prefer a forward commit unless the team explicitly wants its docs/templates history cleaned too.

- [ ] **Step 1: Forward-fix default path**

Commit the central workflow changes normally:

```powershell
git add .github/workflows templates docs
git commit -m "feat: support NestJS monorepo backend systems"
git push origin main
```

Expected: app repos using `@main` can validate monorepo metadata.

- [ ] **Step 2: Optional clean-history path for central-workflow**

If central-workflow must also be rewritten, use the same backup, orphan baseline, verification, and force-with-lease procedure from Task 5.

Expected: `main` and `test` present the monorepo-capable workflow as baseline.

## Phase 5: GitHub Variables and CI Dry Runs

### Task 7: Configure GitHub Variables and Dry-Run CI

**Files/Settings:**
- GitHub repository variables in each backend repo
- GitHub Actions workflow dispatch for each backend repo

- [ ] **Step 1: Remove single-system variable**

In each backend repo's GitHub settings, remove or clear:

```text
BACKEND_SINGLE_SYSTEMS_JSON
```

Expected: central workflow resolves only the multi-system backend config.

- [ ] **Step 2: Set multi-system variable**

Set:

```text
BACKEND_MULTI_SYSTEMS_JSON
```

Use the per-repo JSON from "Canonical CI Systems JSON".

Expected: workflow matrix has two systems: API and location-service.

- [ ] **Step 3: Run dry-run dispatch**

For each backend repo, run `BE Pipeline Caller` from GitHub Actions with:

```text
pipeline_mode=multi
run_deploy=false
run_promotion=false
dry_run=true
enable_security_scan=true
enable_sonar=true
enable_k6=false
```

Expected: matrix resolves both services, installs dependencies once from `install_dir`, runs service-specific tests, and does not deploy.

- [ ] **Step 4: Enable k6 after smoke scripts exist**

Run another dispatch with:

```text
pipeline_mode=multi
run_deploy=false
run_promotion=false
dry_run=true
enable_security_scan=true
enable_sonar=true
enable_k6=true
```

Expected: each service uses its own k6 script path or cleanly skips if branch rules do not include the current branch.

### Execution Note: SonarCloud Opt-Out

Greenovate's SonarCloud project currently rejects CI scanner runs while Automatic Analysis is enabled. Until Automatic Analysis is disabled in SonarCloud, set the GitHub repository variable below for Greenovate only:

```text
ENABLE_SONAR_CI=false
```

The backend central workflow honors this variable by skipping the backend Sonar job while keeping tests, security scans, Docker, k6, and summary gates active.

### Execution Note: Grafana k6 Concurrency

The backend central workflow serializes service-level k6 jobs with `max-parallel: 1`. This prevents a two-service backend monorepo from starting both Grafana Cloud tests at the same time and hitting low-concurrency Grafana Cloud project limits.

## Phase 6: Normal Flow Restoration

### Task 8: Resume Normal Branch Flow

**Files/Settings:**
- Branch protections
- Promotion PRs
- Render or deployment service mapping

- [ ] **Step 1: Push a no-op docs change to `test`**

After rewrite, create a small docs-only commit on `test`:

```powershell
git checkout test
git commit --allow-empty -m "chore: verify monorepo pipeline"
git push origin test
```

Expected: push pipeline runs on the clean history.

- [ ] **Step 2: Confirm promotion branch behavior**

Expected branch behavior:

```text
test -> uat promotion PR
uat -> main promotion PR
main -> production release/version stream
```

Expected version streams:

```text
api
location-service
```

- [ ] **Step 3: Confirm deployment mapping**

Each service needs its own deployment target or explicit skip:

```text
<repo>-api -> HTTP app
<repo>-location-service -> TCP microservice app
```

Expected: Render/GHCR/deployment hooks do not confuse API and microservice images.

## Phase 7: Closeout

### Task 9: Final Alignment Checklist

- [x] `central-workflow` supports NestJS monorepo systems in backend matrix jobs.
- [x] `template-repo-be-nest` has no root `src/` application shape.
- [x] Every tribe repo has `apps/api`, `apps/location-service`, and shared `libs/*`.
- [x] Every repo's `nest-cli.json` has `monorepo: true` and `projects`.
- [x] Every repo's `package.json` no longer says `template-repo-be-single`.
- [ ] Every repo uses `BACKEND_MULTI_SYSTEMS_JSON`.
- [x] Every repo has local bundle backups under `C:\Codes\secret-ops\history-backups`.
- [ ] `main`, `uat`, and `test` no longer expose old standalone app history after the rewrite.
- [ ] Branch protections are restored.
- [ ] GitHub Actions dry run passes for every repo.
- [ ] Normal `test -> uat -> main` flow resumes.

## Implementation Run Log

### 2026-05-19 local execution

Completed locally:

- Phase 0: bundle backups and branch inventory were created under `C:\Codes\secret-ops\history-backups`.
- Phase 1: `central-workflow` now normalizes backend monorepo service metadata with `install_dir`, `test_command`, `build_command`, `dockerfile_path`, service-specific k6 options, and Docker BuildKit `GITHUB_TOKEN` secret support.
- Phase 2: `template-repo-be-nest` was converted into the canonical NestJS monorepo with `apps/api`, `apps/location-service`, and shared `libs/common`, `libs/api-center`, `libs/contracts`, and `libs/supabase`.
- Phase 3: the canonical monorepo structure was propagated to `campus-one-be`, `greenovate-be`, `paki-apps-be`, `sho-team-be`, `smurf-village-be`, and `trini-thrive-be`.
- Tribe package names now use `<repo>-monorepo`, and tribe manifests now use repo-specific service IDs and scopes.

Local verification passed for `template-repo-be-nest`:

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:cov -- --runInBand
npm run test:e2e -- --runInBand
$env:GITHUB_TOKEN='local-placeholder'; npm ci --ignore-scripts --dry-run
git diff --check
```

Local verification passed for every tribe repo:

```powershell
npm run lint -- --quiet
npm run typecheck
npm run build
npm run test:cov -- --runInBand --silent
npm run test:e2e -- --runInBand --silent
$env:GITHUB_TOKEN='local-placeholder'; npm ci --ignore-scripts --dry-run --silent
git diff --check
```

Notes:

- Local `npm install` used `C:\Codes\apic\api-shared-services` to satisfy `@implementsprint/sdk` because the real GitHub Packages token is only available in GitHub Actions.
- Docker builds were not run locally because the private package install needs the real GitHub Actions `GITHUB_TOKEN`; the central workflow now passes that token as a BuildKit secret.
- On Windows, `nest build --all` can print trailing `Error: spawn EPERM` after successful webpack compilations. The commands exited successfully during verification.
- `git diff --check` may print CRLF conversion warnings on Windows; those warnings are not failures.

Still gated:

- Phase 4 branch publication: local two-commit histories are prepared on the current working branches, but no `git push --force-with-lease` has run. Confirm branch protections, freeze windows, and target branch mapping before publishing.
- Phase 5: set `BACKEND_MULTI_SYSTEMS_JSON` repo variables, clear `BACKEND_SINGLE_SYSTEMS_JSON`, and run GitHub Actions dry runs.
- Phase 6: restore branch protections and confirm `test -> uat -> main` promotion.

## Rollback Plan

If a rewrite goes wrong, recover from the local bundle:

```powershell
New-Item -ItemType Directory -Force -Path C:\Codes\secret-ops\restore-check
git clone C:\Codes\secret-ops\history-backups\template-repo-be-nest-before-nestjs-monorepo-2026-05-19.bundle C:\Codes\secret-ops\restore-check\template-repo-be-nest
```

Inspect recovered refs:

```powershell
git -C C:\Codes\secret-ops\restore-check\template-repo-be-nest branch -a -v --no-abbrev
```

Restore a branch only with explicit approval:

```powershell
git -C C:\Codes\secret-ops\restore-check\template-repo-be-nest push --force-with-lease origin refs/heads/main:refs/heads/main
```

## Execution Order

1. Phase 0: Freeze all target repos, fetch all refs, create bundle backups, and record branch heads.
2. Phase 1: Update and validate `central-workflow` so monorepo service metadata works before app repos depend on it.
3. Phase 2: Convert and validate `template-repo-be-nest`; this becomes the source of truth for tribe repos.
4. Phase 3a: Convert and validate one pilot tribe repo, preferably `campus-one-be`.
5. Phase 5 pilot check: Run dry-run CI for the pilot before touching remaining tribes.
6. Phase 3b: Convert and validate the remaining tribe repos.
7. Phase 4: Rewrite template and tribe branch histories into the curated two-commit shape, with `HEAD~1` as the conversion and `HEAD` as fixes.
8. Phase 5: Set `BACKEND_MULTI_SYSTEMS_JSON`, clear `BACKEND_SINGLE_SYSTEMS_JSON`, and run dry-run CI across all repos.
9. Phase 6: Restore branch protections, deploy mappings, and promotion flow.
10. Phase 7: Complete final alignment checklist and keep backups.

## Notes for the Executor

- Use the template repo as the source of truth after Task 3 passes.
- Do not bulk-copy over `tribe-manifest.json`; preserve tribe identity.
- Do not commit `.env` values.
- Do not delete old history backups after force-push.
- Treat `monorepo` and `deployment boundary` as separate decisions: the repo layout is shared, but each `apps/*` runtime can still deploy independently.
