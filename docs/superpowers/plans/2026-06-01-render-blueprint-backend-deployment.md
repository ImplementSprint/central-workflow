# Render Blueprint Backend Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Render Blueprint path so tribe backend repos can define deployable services in `render.yaml` instead of manually creating every Render service and copying deploy hooks into GitHub secrets.

**Architecture:** Keep `BACKEND_MULTI_SYSTEMS_JSON` as the CI service inventory and make `render.yaml` the Render infrastructure contract. Central workflow validates that both files describe the same deployable services, documents the secure environment-variable strategy, and optionally generates a starter `render.yaml` from systems JSON. Render remains responsible for service creation/sync; GitHub Actions remains responsible for CI gates and health verification.

**Tech Stack:** GitHub Actions, Render Blueprints (`render.yaml`), Node.js validation/generation scripts, YAML parsing, existing backend reusable workflows.

---

## File Structure

- Create `docs/render-blueprint-backend-contract.md`
  - Documents the supported `render.yaml` shape for tribe backend repos, branch/environment mapping, env group naming, and secret policy.
- Create `scripts/render-blueprint/generate-backend-render-yaml.mjs`
  - Generates a starter `render.yaml` from a checked-in systems JSON file or from a JSON argument.
- Create `scripts/render-blueprint/validate-backend-render-yaml.mjs`
  - Validates that `render.yaml` and `BACKEND_MULTI_SYSTEMS_JSON` service names, Dockerfile paths, and health paths stay aligned.
- Create `fixtures/render-blueprint/backend-multi-systems.json`
  - Small canonical backend service inventory fixture.
- Create `fixtures/render-blueprint/render.yaml`
  - Expected generated Blueprint fixture.
- Modify `.github/workflows/workflow-validation.yml`
  - Adds a validation job for the fixture and a reusable workflow-call path for consumer repos that pass systems JSON.
- Modify `docs/workflow-contract-registry.md`
  - Adds the Blueprint contract and explains that deploy hook secrets become optional once Blueprint deployment is adopted.
- Modify `docs/template-be-nest.md`
  - Adds the tribe setup checklist for `render.yaml`, env groups, and first Render Blueprint sync.
- Modify `docs/backend-multi-systems-json-service-split.md`
  - Cross-links the Blueprint plan and clarifies that deployable services need Dockerfiles because Render Blueprint services use the same Docker paths.

## Design Decisions

- `BACKEND_MULTI_SYSTEMS_JSON` remains the CI source for which services exist and how each service builds/tests.
- `render.yaml` becomes the Render source for service creation and Render runtime settings.
- The first implementation should validate alignment. It should not create Render resources via API.
- Secrets stay out of git. Use Render env groups for shared runtime secrets and `sync: false` only for service-local secrets that must be manually supplied during initial Blueprint creation.
- The public gateway service should be `type: web`. Internal domain services should default to `type: pserv` or `type: web` based on an explicit `render_service_type` field if Render requires different service-type values in the current Blueprint spec. The implementation must verify exact Render Blueprint service type values against current Render docs before coding.
- GitHub Actions should not own a high-privilege `RENDER_API_KEY` in this phase.

### Task 1: Document the Render Blueprint Contract

**Files:**
- Create: `docs/render-blueprint-backend-contract.md`
- Modify: `docs/workflow-contract-registry.md`
- Modify: `docs/template-be-nest.md`

- [ ] **Step 1: Create the contract doc**

Create `docs/render-blueprint-backend-contract.md` with this content:

```markdown
# Render Blueprint Backend Contract

## Purpose

Tribe backend repos use `BACKEND_MULTI_SYSTEMS_JSON` for CI and `render.yaml` for Render infrastructure. The two files must describe the same deployable services.

## Service Inventory

Every deployable service must have:

- One `BACKEND_MULTI_SYSTEMS_JSON` entry.
- One `render.yaml` service entry.
- One Dockerfile at the configured `dockerfile_path`.
- One health endpoint exposed at `/api/v1/health` unless the service explicitly overrides the health path.

Shared libraries under `libs/` are not deployable services and must not appear in either service list.

## Environments

Use the existing branch convention:

| Git branch | Render environment | Purpose |
| --- | --- | --- |
| `test` | test | integration testing |
| `uat` | uat | user acceptance |
| `main` | production | production release |

Each tribe should create one Blueprint per environment if the Render workspace needs separate test, uat, and production resources.

## Secret Strategy

Commit non-secret values:

- service names
- Dockerfile paths
- health paths
- branch names
- non-secret URLs
- feature flags that are not credentials

Do not commit secret values:

- `APICENTER_TRIBE_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- database passwords
- OAuth client secrets
- API keys

Use Render environment groups for shared secrets:

- `<tribe>-test`
- `<tribe>-uat`
- `<tribe>-production`

Use `sync: false` only for service-local secrets that Render should ask for during initial Blueprint creation.

## Blueprint Sync Rule

Do not manage the same Render service with more than one Blueprint. A service belongs to one Blueprint only.

## Central Workflow Role

Central workflow validates the repo contract and performs CI gates. Render creates and updates services from `render.yaml`.
```

- [ ] **Step 2: Add the contract registry entry**

In `docs/workflow-contract-registry.md`, update the Backend row notes to include:

```markdown
Render Blueprint adoption: backend repos may add `render.yaml` as the Render infrastructure contract. `BACKEND_MULTI_SYSTEMS_JSON` remains required for CI service matrix resolution. When a repo uses Blueprints, central workflow validates that `render.yaml` and `BACKEND_MULTI_SYSTEMS_JSON` have matching service names and Dockerfile paths. Deploy hook secrets are optional in Blueprint-managed repos that rely on Render auto-sync after CI checks.
```

- [ ] **Step 3: Add the Nest template checklist**

In `docs/template-be-nest.md`, add this checklist near the systems JSON section:

```markdown
### Render Blueprint Setup

1. Add `BACKEND_MULTI_SYSTEMS_JSON` with one entry per deployable app.
2. Add `render.yaml` with one Render service per deployable app.
3. Create Render environment groups for test, uat, and production.
4. Put runtime secrets in Render environment groups, not in GitHub Actions.
5. Connect the repo as a Render Blueprint once per environment.
6. Run central workflow validation before enabling Render auto-sync.
```

- [ ] **Step 4: Commit the docs**

Run:

```bash
git add docs/render-blueprint-backend-contract.md docs/workflow-contract-registry.md docs/template-be-nest.md
git commit -m "docs: define render blueprint backend contract"
```

Expected: a docs-only commit.

### Task 2: Add Render Blueprint Fixtures

**Files:**
- Create: `fixtures/render-blueprint/backend-multi-systems.json`
- Create: `fixtures/render-blueprint/render.yaml`

- [ ] **Step 1: Add backend systems fixture**

Create `fixtures/render-blueprint/backend-multi-systems.json`:

```json
[
  {
    "name": "api",
    "dir": ".",
    "install_dir": ".",
    "project": "api",
    "image": "api",
    "backend_stack": "nestjs",
    "version_stream": "api",
    "test_command": "npm run test:cov -- --selectProjects api",
    "dockerfile_path": "apps/api/Dockerfile",
    "k6_script_path": "tests/performance/api-smoke.js",
    "render_service_type": "web",
    "healthcheck_path": "/api/v1/health"
  },
  {
    "name": "location-service",
    "dir": ".",
    "install_dir": ".",
    "project": "location-service",
    "image": "location-service",
    "backend_stack": "nestjs",
    "version_stream": "location-service",
    "test_command": "npm run test:cov -- --selectProjects location-service",
    "dockerfile_path": "apps/location-service/Dockerfile",
    "k6_script_path": "tests/performance/location-service-smoke.js",
    "render_service_type": "private",
    "healthcheck_path": "/api/v1/health"
  }
]
```

- [ ] **Step 2: Add expected Blueprint fixture**

Create `fixtures/render-blueprint/render.yaml`:

```yaml
services:
  - type: web
    name: api
    runtime: docker
    dockerfilePath: ./apps/api/Dockerfile
    dockerContext: .
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: APICENTER_TRIBE_SECRET
        sync: false

  - type: pserv
    name: location-service
    runtime: docker
    dockerfilePath: ./apps/location-service/Dockerfile
    dockerContext: .
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: APICENTER_TRIBE_SECRET
        sync: false
```

- [ ] **Step 3: Commit fixtures**

Run:

```bash
git add fixtures/render-blueprint/backend-multi-systems.json fixtures/render-blueprint/render.yaml
git commit -m "test: add render blueprint backend fixtures"
```

Expected: fixtures are committed separately from scripts.

### Task 3: Add Blueprint Generator Script

**Files:**
- Create: `scripts/render-blueprint/generate-backend-render-yaml.mjs`
- Test: `fixtures/render-blueprint/backend-multi-systems.json`
- Test: `fixtures/render-blueprint/render.yaml`

- [ ] **Step 1: Write the generator**

Create `scripts/render-blueprint/generate-backend-render-yaml.mjs`:

```javascript
import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node scripts/render-blueprint/generate-backend-render-yaml.mjs <systems-json-path>");
  process.exit(1);
}

const systems = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!Array.isArray(systems) || systems.length === 0) {
  throw new Error("systems JSON must be a non-empty array");
}

function renderType(system) {
  const raw = String(system.render_service_type || (system.name === "api" ? "web" : "private")).toLowerCase();
  if (raw === "web") return "web";
  if (raw === "private" || raw === "pserv" || raw === "private-service") return "pserv";
  throw new Error(`Unsupported render_service_type for ${system.name}: ${raw}`);
}

function requireString(system, key) {
  const value = system[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required ${key} for ${system.name || "unnamed service"}`);
  }
  return value.trim();
}

const lines = ["services:"];

for (const system of systems) {
  const name = requireString(system, "name");
  const dockerfilePath = requireString(system, "dockerfile_path");
  const healthPath = system.healthcheck_path || "/api/v1/health";
  const dockerContext = system.render_docker_context || system.dir || ".";

  lines.push(`  - type: ${renderType(system)}`);
  lines.push(`    name: ${name}`);
  lines.push("    runtime: docker");
  lines.push(`    dockerfilePath: ./${dockerfilePath.replace(/^\\.\\//, "")}`);
  lines.push(`    dockerContext: ${dockerContext}`);
  lines.push(`    healthCheckPath: ${healthPath}`);
  lines.push("    envVars:");
  lines.push("      - key: NODE_ENV");
  lines.push("        value: production");
  lines.push("      - key: APICENTER_TRIBE_SECRET");
  lines.push("        sync: false");
  lines.push("");
}

process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
```

- [ ] **Step 2: Run generator against fixture**

Run:

```bash
node scripts/render-blueprint/generate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json > /tmp/generated-render.yaml
diff -u fixtures/render-blueprint/render.yaml /tmp/generated-render.yaml
```

Expected: no diff.

- [ ] **Step 3: Commit generator**

Run:

```bash
git add scripts/render-blueprint/generate-backend-render-yaml.mjs
git commit -m "feat: add backend render blueprint generator"
```

Expected: generator is committed after fixture proof.

### Task 4: Add Blueprint Validator Script

**Files:**
- Create: `scripts/render-blueprint/validate-backend-render-yaml.mjs`
- Test: `fixtures/render-blueprint/backend-multi-systems.json`
- Test: `fixtures/render-blueprint/render.yaml`

- [ ] **Step 1: Write the validator**

Create `scripts/render-blueprint/validate-backend-render-yaml.mjs`:

```javascript
import fs from "node:fs";

const [systemsPath, renderPath] = process.argv.slice(2);

if (!systemsPath || !renderPath) {
  console.error("Usage: node scripts/render-blueprint/validate-backend-render-yaml.mjs <systems-json-path> <render-yaml-path>");
  process.exit(1);
}

const systems = JSON.parse(fs.readFileSync(systemsPath, "utf8"));
const renderYaml = fs.readFileSync(renderPath, "utf8");

if (!Array.isArray(systems) || systems.length === 0) {
  throw new Error("systems JSON must be a non-empty array");
}

const renderServiceNames = [...renderYaml.matchAll(/^\s*-\s+type:\s+\S+\n\s+name:\s+([^\n]+)/gm)]
  .map((match) => match[1].trim());

const missingInRender = systems
  .map((system) => system.name)
  .filter((name) => !renderServiceNames.includes(name));

if (missingInRender.length > 0) {
  throw new Error(`render.yaml is missing services: ${missingInRender.join(", ")}`);
}

for (const system of systems) {
  const dockerfile = String(system.dockerfile_path || "").replace(/^\\.\\//, "");
  if (!dockerfile) {
    throw new Error(`${system.name} is missing dockerfile_path`);
  }
  const expectedLine = `dockerfilePath: ./${dockerfile}`;
  if (!renderYaml.includes(expectedLine)) {
    throw new Error(`render.yaml missing ${expectedLine} for ${system.name}`);
  }
}

console.log(`Validated ${systems.length} backend Render Blueprint services.`);
```

- [ ] **Step 2: Run validator against fixture**

Run:

```bash
node scripts/render-blueprint/validate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json fixtures/render-blueprint/render.yaml
```

Expected:

```text
Validated 2 backend Render Blueprint services.
```

- [ ] **Step 3: Commit validator**

Run:

```bash
git add scripts/render-blueprint/validate-backend-render-yaml.mjs
git commit -m "feat: validate backend render blueprint contract"
```

Expected: validator is committed after fixture proof.

### Task 5: Wire Validation Into Central Workflow

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`
- Test: `fixtures/render-blueprint/backend-multi-systems.json`
- Test: `fixtures/render-blueprint/render.yaml`

- [ ] **Step 1: Add validation job**

Add this job to `.github/workflows/workflow-validation.yml`:

```yaml
  validate-render-blueprint-fixture:
    name: "Validate Render Blueprint Fixture"
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout Code
        uses: actions/checkout@v5

      - name: Validate generated Render Blueprint
        shell: bash
        run: |
          set -euo pipefail
          node scripts/render-blueprint/generate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json > /tmp/generated-render.yaml
          diff -u fixtures/render-blueprint/render.yaml /tmp/generated-render.yaml
          node scripts/render-blueprint/validate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json fixtures/render-blueprint/render.yaml
```

- [ ] **Step 2: Run local workflow file checks**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 3: Run script checks locally**

Run:

```bash
node scripts/render-blueprint/generate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json > /tmp/generated-render.yaml
diff -u fixtures/render-blueprint/render.yaml /tmp/generated-render.yaml
node scripts/render-blueprint/validate-backend-render-yaml.mjs fixtures/render-blueprint/backend-multi-systems.json fixtures/render-blueprint/render.yaml
```

Expected:

```text
Validated 2 backend Render Blueprint services.
```

- [ ] **Step 4: Commit workflow validation**

Run:

```bash
git add .github/workflows/workflow-validation.yml
git commit -m "ci: validate render blueprint fixtures"
```

Expected: workflow validation now covers the Blueprint contract.

### Task 6: Update Deployment Guidance Away From Per-Service Hook Copying

**Files:**
- Modify: `docs/backend-multi-systems-json-service-split.md`
- Modify: `docs/template-callers.md`
- Modify: `docs/migration-existing-repository.md`

- [ ] **Step 1: Update service split doc**

In `docs/backend-multi-systems-json-service-split.md`, add this section:

```markdown
## Render Blueprint Path

For new tribe backend repos, prefer `render.yaml` over per-service deploy hook secrets. `BACKEND_MULTI_SYSTEMS_JSON` tells CI what to build and test; `render.yaml` tells Render what to create and run.

Use deploy hook secrets only as a transition path for repos that already have manually-created Render services.
```

- [ ] **Step 2: Update caller docs**

In `docs/template-callers.md`, add this backend note:

```markdown
For Blueprint-managed backend repos, the caller workflow does not need one deploy hook secret per service. Render owns service sync from `render.yaml`; central workflow validates CI and Blueprint alignment.
```

- [ ] **Step 3: Update migration docs**

In `docs/migration-existing-repository.md`, add this migration order:

```markdown
Backend Render Blueprint migration order:

1. Add or verify `BACKEND_MULTI_SYSTEMS_JSON`.
2. Generate `render.yaml`.
3. Validate `render.yaml` against systems JSON.
4. Create Render env groups and enter secret values.
5. Connect the repo Blueprint in Render.
6. Run central workflow dry-run with deploy disabled.
7. Enable Render Blueprint sync after CI is stable.
```

- [ ] **Step 4: Commit docs**

Run:

```bash
git add docs/backend-multi-systems-json-service-split.md docs/template-callers.md docs/migration-existing-repository.md
git commit -m "docs: add backend render blueprint rollout guidance"
```

Expected: docs explain the new default path.

### Task 7: Pilot On One Tribe Backend Repo

**Files:**
- Create in pilot repo: `render.yaml`
- Read in pilot repo: `nest-cli.json`
- Read in pilot repo: `package.json`
- Read in pilot repo: `apps/*/Dockerfile`

- [ ] **Step 1: Pick pilot repo**

Use `trini-thrive-be` as the pilot because it already has multiple deployable app folders and Dockerfiles.

Run:

```bash
Get-ChildItem -LiteralPath C:\Codes\secret-ops\trini-thrive-be\apps -Directory | Select-Object -ExpandProperty Name
```

Expected:

```text
api
hopecard-admin-service
hopecard-beneficiary-service
hopecard-campaign-manager-service
hopecard-donor-service
hopecard-notification-service
location-service
```

- [ ] **Step 2: Generate pilot `render.yaml`**

Save the pilot repo's systems JSON to a local file and run:

```bash
node C:\Codes\secret-ops\central-workflow\scripts\render-blueprint\generate-backend-render-yaml.mjs C:\tmp\trini-backend-multi-systems.json > C:\Codes\secret-ops\trini-thrive-be\render.yaml
```

Expected: `render.yaml` contains one Render service per deployable app.

- [ ] **Step 3: Validate pilot `render.yaml`**

Run:

```bash
node C:\Codes\secret-ops\central-workflow\scripts\render-blueprint\validate-backend-render-yaml.mjs C:\tmp\trini-backend-multi-systems.json C:\Codes\secret-ops\trini-thrive-be\render.yaml
```

Expected:

```text
Validated 7 backend Render Blueprint services.
```

- [ ] **Step 4: Manually review service types**

Open `C:\Codes\secret-ops\trini-thrive-be\render.yaml` and confirm:

- `api` is public.
- internal Hopecard services are private unless they must receive public traffic.
- `location-service` is private unless frontend/mobile calls it directly.

- [ ] **Step 5: Commit pilot Blueprint**

Run:

```bash
git -C C:\Codes\secret-ops\trini-thrive-be add render.yaml
git -C C:\Codes\secret-ops\trini-thrive-be commit -m "chore: add render blueprint"
```

Expected: the pilot repo has a reviewable Blueprint file.

### Task 8: Validate With Render Dashboard Before Enabling Auto-Sync

**Files:**
- No repo file changes.
- Render Dashboard operation.

- [ ] **Step 1: Create Render env groups**

Create these Render environment groups for the pilot:

```text
trini-thrive-test
trini-thrive-uat
trini-thrive-production
```

Expected: each group contains runtime secrets needed by the services.

- [ ] **Step 2: Connect Blueprint**

In Render Dashboard, create a Blueprint from the pilot repo and select the branch/environment being tested.

Expected: Render previews the services that will be created or updated.

- [ ] **Step 3: Confirm no duplicates**

Before applying the Blueprint, compare proposed Render service names to existing services.

Expected: no duplicate service names are created unintentionally.

- [ ] **Step 4: Apply Blueprint manually**

Trigger the first Blueprint sync manually.

Expected: services provision successfully and ask for any `sync: false` values during initial creation.

### Task 9: Final CI And Docs Verification

**Files:**
- Verify: central-workflow docs and scripts.
- Verify: pilot repo `render.yaml`.

- [ ] **Step 1: Run central validation**

Run:

```bash
git -C C:\Codes\secret-ops\central-workflow diff --check
node C:\Codes\secret-ops\central-workflow\scripts\render-blueprint\generate-backend-render-yaml.mjs C:\Codes\secret-ops\central-workflow\fixtures\render-blueprint\backend-multi-systems.json > C:\tmp\generated-render.yaml
node C:\Codes\secret-ops\central-workflow\scripts\render-blueprint\validate-backend-render-yaml.mjs C:\Codes\secret-ops\central-workflow\fixtures\render-blueprint\backend-multi-systems.json C:\Codes\secret-ops\central-workflow\fixtures\render-blueprint\render.yaml
```

Expected:

```text
Validated 2 backend Render Blueprint services.
```

- [ ] **Step 2: Run pilot validation**

Run:

```bash
node C:\Codes\secret-ops\central-workflow\scripts\render-blueprint\validate-backend-render-yaml.mjs C:\tmp\trini-backend-multi-systems.json C:\Codes\secret-ops\trini-thrive-be\render.yaml
```

Expected:

```text
Validated 7 backend Render Blueprint services.
```

- [ ] **Step 3: Confirm docs mention secret boundary**

Run:

```bash
rg -n "sync: false|environment groups|Do not commit secret" C:\Codes\secret-ops\central-workflow\docs
```

Expected: Blueprint docs clearly describe that secrets stay out of git.

- [ ] **Step 4: Commit final cleanup**

Run:

```bash
git -C C:\Codes\secret-ops\central-workflow status --short
```

Expected: only intentional files are changed. Commit any final docs cleanup separately.

## Rollout Notes

- Start with one pilot repo and one environment.
- Keep Render Blueprint auto-sync disabled until the first manual sync is reviewed.
- Do not add `RENDER_API_KEY` in this phase.
- Keep deploy hook support in central-workflow as a transition path for repos that are not Blueprint-managed yet.
- After two successful pilot deploys, repeat the migration for each tribe backend repo.

## Self-Review

- Spec coverage: plan covers docs, generation, validation, workflow integration, pilot rollout, and Render dashboard bootstrap.
- Placeholder scan: no placeholder markers are present.
- Type consistency: `render_service_type`, `healthcheck_path`, `dockerfile_path`, and service `name` are used consistently across fixture, generator, and validator tasks.
