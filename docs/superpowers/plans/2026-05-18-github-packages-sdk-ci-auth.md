# GitHub Packages SDK CI Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every approved tribe repository able to install `@implementsprint/sdk` through the central CI/CD workflows without personal tokens or one-off per-repo workflow patches.

**Architecture:** Treat SDK installation as a platform contract with four parts: a safe committed consumer `.npmrc`, central reusable workflow support for GitHub Packages auth, explicit GitHub Package access for each tribe repository, and versioned rollout of `central-workflow`. Runtime API Center credentials stay separate from package-install credentials.

**Tech Stack:** GitHub Actions reusable workflows, GitHub Packages npm registry, npm, `actions/setup-node`, `GITHUB_TOKEN`, central workflow caller templates, Markdown docs.

---

## Current Problem

CI fails during dependency installation with:

```text
npm error 401 Unauthorized - GET https://npm.pkg.github.com/download/@implementsprint/sdk/1.0.3/... - unauthenticated: User cannot be authenticated with the token provided.
```

The deprecated `inflight` and `glob` warnings are not the blocker. The blocker is package install authentication for `@implementsprint/sdk@1.0.3` from GitHub Packages.

For multiple tribes, the fix should not depend on each team inventing its own token setup. The platform should provide a repeatable contract:

- Tribe repos commit a safe `.npmrc` placeholder.
- Central workflows provide install-time auth.
- GitHub Packages grants each approved tribe repo package read access.
- Tribe repos consume `central-workflow@main` so central fixes are picked up immediately.

---

## Target Operating Model

### Tribe Repository Contract

Each Node/TypeScript tribe repo that installs the SDK has this project-level `.npmrc`:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Rules:

- Commit the placeholder `.npmrc`.
- Never commit a literal token.
- Do not put `GITHUB_TOKEN` in runtime `.env` files.
- Runtime AP Center values remain separate: `APICENTER_URL`, `APICENTER_TRIBE_ID`, and `APICENTER_TRIBE_SECRET`.

### Central Workflow Contract

Every reusable workflow job that can run `npm ci`, `npm install`, `yarn install`, or `pnpm install` for a tribe repo must:

- Have `permissions.packages: read` unless the job already has `packages: write`.
- Configure `actions/setup-node` for GitHub Packages when npm is used.
- Pass `NODE_AUTH_TOKEN: ${{ github.token }}` and `GITHUB_TOKEN: ${{ github.token }}` to the dependency install step.

Recommended setup-node block for npm lanes:

```yaml
- name: Setup Node.js ${{ inputs.node-version }}
  uses: actions/setup-node@v5
  with:
    node-version: ${{ inputs.node-version }}
    cache: "npm"
    cache-dependency-path: |
      **/package-lock.json
    registry-url: "https://npm.pkg.github.com"
    scope: "@implementsprint"
    always-auth: true
```

Recommended install env:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

### Package Access Contract

The `@implementsprint/sdk` GitHub Package must grant access to each approved tribe repository that uses it in Actions.

Operational rule:

- If a repo gets `401 Unauthorized` after the `.npmrc` and workflow token wiring are correct, check package repository access before changing SDK code.

---

## Files And Responsibilities

### Central Workflow Files

- `.github/workflows/backend-tests.yml`
  - Backend unit/integration dependency installation.
- `.github/workflows/backend-db-check.yml`
  - Backend migration/database check dependency installation.
- `.github/workflows/backend-workflow.yml`
  - Backend reusable orchestrator permissions.
- `.github/workflows/master-pipeline-be.yml`
  - Backend master pipeline permissions and release-facing behavior.
- `.github/workflows/frontend-tests.yml`
  - Frontend unit test dependency installation.
- `.github/workflows/frontend-standards-check.yml`
  - Frontend standards dependency installation.
- `.github/workflows/lint-check.yml`
  - Shared lint dependency installation.
- `.github/workflows/governance-check.yml`
  - Governance dependency installation.
- `.github/workflows/front-end-workflow.yml`
  - Frontend build dependency installation.
- `.github/workflows/security-scan.yml`
  - npm audit/license dependency installation.
- `.github/workflows/mobile-tests.yml`
  - Mobile unit test dependency installation.
- `.github/workflows/mobile-gradle.yml`
  - React Native/Expo Android dependency installation.
- `.github/workflows/mobile-ios-build.yml`
  - Expo iOS dependency installation.
- `.github/workflows/mobile-rn-ios-build.yml`
  - React Native iOS dependency installation.
- `.github/workflows/mobile-maestro.yml`
  - Android Maestro dependency installation.
- `.github/workflows/mobile-maestro-ios.yml`
  - iOS Maestro dependency installation.
- `.github/workflows/mobile-release-build.yml`
  - Android/iOS release dependency installation.
- `.github/workflows/mobile-workflow.yml`
  - Mobile orchestrated Android/iOS dependency installation.
- `.github/workflows/playwright-e2e.yml`
  - Browser E2E dependency installation.
- `.github/workflows/selenium-e2e.yml`
  - Selenium E2E dependency installation.

### Template And Documentation Files

- `docs/README.md`
  - Global provider-source guidance and SDK install-auth policy.
- `docs/template-be-node.md`
  - Backend Node caller setup.
- `docs/template-be-nest.md`
  - Backend Nest caller setup.
- `docs/template-fe-single.md`
  - Frontend single-app caller setup if frontend tribes install the SDK.
- `docs/template-fe-multi.md`
  - Frontend multi-app caller setup if frontend tribes install the SDK.
- `docs/template-mobile-expo-single.md`
  - Expo caller setup if mobile apps install the SDK.
- `docs/template-mobile-react-native.md`
  - React Native caller setup if mobile apps install the SDK.
- `templates/be-pipeline-caller.yml`
  - Backend caller template permission baseline.
- `templates/fe-pipeline-caller.yml`
  - Frontend caller template permission baseline.
- `templates/mobile-pipeline-caller.yml`
  - Mobile caller template permission baseline.

### Release And Verification Files

- Create: `docs/github-packages-sdk-ci-auth-rollout.md`
  - Human runbook for package access, verification commands, `@main` rollout, and common failures.
- Optional create: `.github/workflows/workflow-validation.yml` update or reuse existing validation if it already covers changed workflows.

---

## Phase 0: Confirm The Real Auth Boundary

**Goal:** Prove whether the failing repo has package access, workflow token wiring, and the correct `.npmrc` before changing central workflow behavior.

- [ ] **Step 1: Identify the exact failing caller repo and workflow**

Record:

```text
Caller repository:
Workflow name:
Job name:
Branch:
Central workflow reference, expected @main:
Package version in package-lock.json:
```

Expected result:

```text
The failure is mapped to one caller repo, one job, and one central workflow reference.
```

- [ ] **Step 2: Check the consuming repo `.npmrc`**

Expected file content:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Expected result:

```text
The repo uses @implementsprint, not @apicenter, and uses ${GITHUB_TOKEN}, not a literal token or ${NPM_TOKEN}.
```

- [ ] **Step 3: Check the package lock target**

Run in the consuming repo:

```bash
npm pkg get dependencies.@implementsprint/sdk devDependencies.@implementsprint/sdk
```

Expected result:

```text
The SDK dependency is present in dependencies or devDependencies.
```

Then inspect the lockfile for:

```text
https://npm.pkg.github.com/download/@implementsprint/sdk/
```

Expected result:

```text
package-lock.json resolves @implementsprint/sdk from GitHub Packages.
```

- [ ] **Step 4: Check package access in GitHub Packages**

In GitHub:

```text
@implementsprint/sdk package -> Package settings -> Manage Actions access
```

Expected result:

```text
The consuming tribe repo is listed with access, or an org policy grants it.
```

- [ ] **Step 5: Decide whether central workflow changes are required**

Use this decision table:

| Evidence | Decision |
| --- | --- |
| `.npmrc` is wrong | Fix consuming repo setup first |
| package access is missing | Grant package access first |
| package access and `.npmrc` are correct, but CI still fails | Patch central workflows |
| caller uses old central tag | Update the caller to `@main` |

---

## Phase 1: Standardize Consumer Repo Setup

**Goal:** Make every tribe repo use the same package-install contract.

- [ ] **Step 1: Add or update `.npmrc` in backend template repos**

Use this exact content:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Expected result:

```text
Backend template repos install @implementsprint/sdk through GitHub Packages using the Actions token placeholder.
```

- [ ] **Step 2: Add or update `.npmrc` in frontend template repos that consume the SDK**

Use the same content:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Expected result:

```text
Frontend templates that consume the SDK have the same package-install contract.
```

- [ ] **Step 3: Add or update `.npmrc` in mobile template repos that consume the SDK**

Use the same content:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Expected result:

```text
Mobile templates that consume the SDK have the same package-install contract.
```

- [ ] **Step 4: Document what must not be committed**

Add this note to template setup docs:

```markdown
Do not commit a literal GitHub token. The committed `.npmrc` must contain `${GITHUB_TOKEN}` exactly. For local installs, set `GITHUB_TOKEN` in your shell session. For GitHub Actions, the reusable workflows provide the token during dependency installation.
```

Expected result:

```text
Tribe teams understand that package install auth is separate from runtime API Center auth.
```

---

## Phase 2: Patch Central Reusable Workflows

**Goal:** Make central workflows consistently authenticate dependency installation against GitHub Packages.

- [ ] **Step 1: Patch backend install jobs**

Files:

```text
.github/workflows/backend-tests.yml
.github/workflows/backend-db-check.yml
.github/workflows/backend-workflow.yml
.github/workflows/master-pipeline-be.yml
```

Add or preserve this permission:

```yaml
permissions:
  contents: read
  packages: read
```

For any backend job that runs `npm ci --ignore-scripts`, configure setup-node:

```yaml
with:
  node-version: ${{ inputs.node-version }}
  cache: "npm"
  cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json
  registry-url: "https://npm.pkg.github.com"
  scope: "@implementsprint"
  always-auth: true
```

Add install env:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

Expected result:

```text
Backend CI can install @implementsprint/sdk from GitHub Packages without a custom secret.
```

- [ ] **Step 2: Patch frontend install jobs**

Files:

```text
.github/workflows/frontend-tests.yml
.github/workflows/frontend-standards-check.yml
.github/workflows/lint-check.yml
.github/workflows/governance-check.yml
.github/workflows/front-end-workflow.yml
.github/workflows/security-scan.yml
```

For each job that runs `npm ci --ignore-scripts`, add:

```yaml
permissions:
  contents: read
  packages: read
```

For setup-node npm lanes:

```yaml
with:
  node-version: ${{ inputs.node-version }}
  cache: "npm"
  cache-dependency-path: |
    **/package-lock.json
  registry-url: "https://npm.pkg.github.com"
  scope: "@implementsprint"
  always-auth: true
```

For install steps:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

Expected result:

```text
Frontend CI lanes can install the SDK consistently when a frontend tribe app depends on it.
```

- [ ] **Step 3: Patch mobile install jobs**

Files:

```text
.github/workflows/mobile-tests.yml
.github/workflows/mobile-gradle.yml
.github/workflows/mobile-ios-build.yml
.github/workflows/mobile-rn-ios-build.yml
.github/workflows/mobile-maestro.yml
.github/workflows/mobile-maestro-ios.yml
.github/workflows/mobile-release-build.yml
.github/workflows/mobile-workflow.yml
```

For npm setup lanes:

```yaml
with:
  node-version: ${{ inputs.node-version }}
  cache: "npm"
  cache-dependency-path: |
    **/package-lock.json
  registry-url: "https://npm.pkg.github.com"
  scope: "@implementsprint"
  always-auth: true
```

For install steps that branch on package manager:

```yaml
env:
  PACKAGE_MANAGER: ${{ steps.detect-pm.outputs.pm }}
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

If the workflow uses a different step id such as `detect` or `detect-toolchain`, preserve the existing `PACKAGE_MANAGER` expression and only add the token env values.

Expected result:

```text
Mobile CI lanes can install npm dependencies from GitHub Packages without weakening package permissions.
```

- [ ] **Step 4: Patch E2E install jobs**

Files:

```text
.github/workflows/playwright-e2e.yml
.github/workflows/selenium-e2e.yml
```

Add:

```yaml
permissions:
  contents: read
  packages: read
```

Configure setup-node:

```yaml
with:
  node-version: ${{ inputs.node-version }}
  cache: "npm"
  cache-dependency-path: |
    **/package-lock.json
  registry-url: "https://npm.pkg.github.com"
  scope: "@implementsprint"
  always-auth: true
```

Add install env:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

Expected result:

```text
E2E workflows can run caller-provided install commands that need GitHub Packages auth.
```

---

## Phase 3: Update Central Docs And Caller Templates

**Goal:** Make the expected setup discoverable so future tribe onboarding does not recreate the same 401 failure.

- [ ] **Step 1: Update global setup docs**

Modify `docs/README.md` Internal API Center section to say:

```markdown
Node/TypeScript callers use `@implementsprint/sdk` from GitHub Packages.
Package install auth uses the committed `.npmrc` placeholder plus GitHub Actions `GITHUB_TOKEN`.
Runtime API Center auth still uses `APICENTER_URL`, `APICENTER_TRIBE_ID`, and `APICENTER_TRIBE_SECRET`.
```

Expected result:

```text
The global docs distinguish package-install auth from runtime API Center auth.
```

- [ ] **Step 2: Update backend template setup docs**

Files:

```text
docs/template-be-node.md
docs/template-be-nest.md
```

Replace old legacy registry guidance with:

```markdown
Configure `.npmrc` in the caller repository:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Install:

```bash
npm install @implementsprint/sdk
```

GitHub Actions uses `GITHUB_TOKEN` during installation. Local developers can set `GITHUB_TOKEN` in their shell session when installing from GitHub Packages.
```

Expected result:

```text
Backend setup docs match the published SDK package and the CI auth model.
```

- [ ] **Step 3: Update frontend/mobile docs only where SDK consumption is expected**

Files:

```text
docs/template-fe-single.md
docs/template-fe-multi.md
docs/template-mobile-expo-single.md
docs/template-mobile-react-native.md
```

Add the same `.npmrc` guidance only if those templates are expected to install `@implementsprint/sdk`.

Expected result:

```text
Docs do not imply every frontend/mobile repo must install the SDK, but the ones that do have the exact setup.
```

- [ ] **Step 4: Add package-access runbook**

Create `docs/github-packages-sdk-ci-auth-rollout.md` with these sections:

```markdown
# GitHub Packages SDK CI Auth Rollout

## Who Needs This
Any tribe repo that installs `@implementsprint/sdk` in CI.

## Required Consumer `.npmrc`
[include exact .npmrc]

## Required GitHub Package Access
Add the consuming repo under `@implementsprint/sdk` package Actions access.

## Required Central Workflow Version
Use `@main` for central workflow callers so GitHub Packages install auth support is picked up immediately.

## First CI Check
Run the normal branch pipeline and confirm `npm ci` passes.

## Common Failures
- 401 Unauthorized: check package access, `.npmrc`, and token env.
- 404 Not Found: check package scope/name and package visibility.
- npm uses registry.npmjs.org: check `.npmrc` scope mapping.
```

Expected result:

```text
Operators have one checklist for onboarding a new tribe repo.
```

---

## Phase 4: Validate Locally Without Hitting GitHub Packages

**Goal:** Catch syntax and repo-contract issues before pushing.

- [ ] **Step 1: Check changed workflow YAML for whitespace errors**

Run:

```bash
git diff --check
```

Expected:

```text
No output and exit code 0.
```

- [ ] **Step 2: Inspect all `npm ci` install steps**

Run:

```bash
rg -n "npm ci|NODE_AUTH_TOKEN|GITHUB_TOKEN|registry-url|scope: \"@implementsprint\"|packages: read" .github/workflows
```

Expected:

```text
Every central npm install lane that can run against a tribe repo has token env and GitHub Packages setup.
```

- [ ] **Step 3: Check docs for stale package guidance**

Run:

```bash
rg -n --glob "!docs/superpowers/**" "@apicenter/sdk|NPM_TOKEN|NPM_REGISTRY|@apicenter:registry|private registry" docs templates
```

Expected:

```text
No stale SDK install-auth guidance remains unless a section explicitly describes legacy compatibility.
```

- [ ] **Step 4: Run available workflow validation**

If `actionlint` is available:

```bash
actionlint
```

Expected:

```text
No errors.
```

If `actionlint` is not available, record:

```text
actionlint unavailable locally; validation deferred to GitHub Actions workflow parse.
```

---

## Phase 5: Validate With One Pilot Tribe Repo

**Goal:** Prove the contract end-to-end before rolling it to every tribe.

- [ ] **Step 1: Pick one pilot repo**

Choose a repo that:

```text
Uses package-lock.json
Depends on @implementsprint/sdk
Uses central-workflow through GitHub Actions
Can safely run CI on a test branch
```

- [ ] **Step 2: Grant package access**

In GitHub Packages:

```text
@implementsprint/sdk -> Package settings -> Manage Actions access -> Add pilot repo
```

Expected:

```text
Pilot repo is listed with package access.
```

- [ ] **Step 3: Point pilot repo to the test central workflow ref**

If validating before release, temporarily use:

```yaml
uses: ImplementSprint/central-workflow/.github/workflows/master-pipeline-be.yml@main
```

Expected:

```text
Pilot repo uses @main and receives the central workflow package install auth support immediately.
```

- [ ] **Step 4: Run pilot CI**

Trigger CI on `test`.

Expected:

```text
npm ci reaches the package tarball URL and succeeds without 401.
```

- [ ] **Step 5: Confirm failures stay actionable**

If CI still fails with 401, check in this order:

```text
1. Pilot repo package access in @implementsprint/sdk settings
2. Pilot repo .npmrc scope mapping
3. Install step env includes NODE_AUTH_TOKEN
4. Job permissions include packages: read
5. Caller workflow is using the patched central ref
```

Expected:

```text
The root cause can be isolated without changing SDK runtime code.
```

---

## Phase 6: Merge Central Workflow To Main

**Goal:** Make the package-auth fix available to all tribe repos that point to `central-workflow@main`.

- [ ] **Step 1: Commit central workflow and doc changes**

Suggested commit:

```bash
git add .github/workflows docs templates
git commit -m "fix: support github packages sdk installs in ci"
```

Expected:

```text
Commit contains workflow auth support and docs/runbook updates.
```

- [ ] **Step 2: Push central workflow branch**

Run:

```bash
git push origin <branch-name>
```

Expected:

```text
Branch is available in GitHub.
```

- [ ] **Step 3: Merge through the normal review path**

Expected:

```text
main contains the validated workflow changes.
```

- [ ] **Step 4: Confirm no tag rollout is required**

Run:

```bash
rg -n "central-workflow/.+@v[0-9]" docs templates .github
```

Expected:

```text
No active caller template or documentation still tells tribes to use version tags.
```

---

## Phase 7: Roll Out To Tribe Repositories

**Goal:** Move tribes in a controlled way and make failures easy to diagnose.

- [ ] **Step 1: Build the tribe repo inventory**

Create a table:

```markdown
| Tribe | Repo | Uses SDK | Workflow Type | Current Ref | Package Access Granted | Updated Ref | CI Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| payments | example-payments-api | yes | backend | v1 | no | main | pending |
```

Expected:

```text
Every SDK-consuming tribe repo is visible before rollout starts.
```

- [ ] **Step 2: Grant package access per repo**

For each `Uses SDK = yes` repo:

```text
@implementsprint/sdk package -> add repository access
```

Expected:

```text
Package access is granted before the workflow reference changes.
```

- [ ] **Step 3: Update central workflow refs**

For backend repos:

```yaml
uses: ImplementSprint/central-workflow/.github/workflows/master-pipeline-be.yml@main
```

For frontend repos:

```yaml
uses: ImplementSprint/central-workflow/.github/workflows/master-pipeline-fe.yml@main
```

For mobile repos:

```yaml
uses: ImplementSprint/central-workflow/.github/workflows/master-pipeline-mobile.yml@main
```

Expected:

```text
Each tribe repo uses a central workflow version with the package-auth fix.
```

- [ ] **Step 4: Run CI per repo**

Expected:

```text
npm ci passes in each SDK-consuming repo.
```

- [ ] **Step 5: Record rollout status**

Update `docs/github-packages-sdk-ci-auth-rollout.md` or a rollout tracker with:

```text
Repo name
Workflow ref
Package access status
First passing run URL
Open issue if failed
```

Expected:

```text
The platform team can tell which tribes are ready and which are blocked.
```

---

## Phase 8: Guardrails And Future Maintenance

**Goal:** Prevent this class of failure from returning.

- [ ] **Step 1: Add onboarding checklist item**

Add this checklist item to template docs:

```markdown
- [ ] If this repo installs `@implementsprint/sdk`, confirm the repo is granted access in GitHub Packages before enabling CI.
```

- [ ] **Step 2: Add diagnostic command docs**

For local developer checks:

```bash
npm whoami --registry=https://npm.pkg.github.com
npm view @implementsprint/sdk version --registry=https://npm.pkg.github.com
```

Expected:

```text
Developers can verify package auth outside CI when needed.
```

- [ ] **Step 3: Keep runtime auth separate in docs**

Add or preserve this note:

```markdown
`GITHUB_TOKEN` is only for dependency installation from GitHub Packages. API Center runtime access still requires AP Center tribe credentials and consumes/scope policy.
```

Expected:

```text
Teams do not confuse package install success with runtime API Center authorization.
```

- [ ] **Step 4: Review whether public npm is needed later**

Decision rule:

```text
Stay on GitHub Packages while SDK consumers are known organization tribe repos.
Consider npmjs only if external/public consumers need unauthenticated install.
```

Expected:

```text
Distribution stays private and controlled unless the product requirement changes.
```

---

## Verification Matrix

| Area | Command or Check | Expected Result |
| --- | --- | --- |
| Workflow whitespace | `git diff --check` | Exit 0 |
| Stale docs | `rg -n --glob "!docs/superpowers/**" "@apicenter/sdk|NPM_TOKEN|NPM_REGISTRY|@apicenter:registry|private registry" docs templates` | No stale active guidance |
| Workflow token env | `rg -n "NODE_AUTH_TOKEN|GITHUB_TOKEN" .github/workflows` | Install jobs expose token env |
| Workflow permissions | `rg -n "packages: read|packages: write" .github/workflows` | Jobs that install packages have package permission |
| Package access | GitHub Package settings | Consuming repos listed |
| Pilot CI | GitHub Actions run | `npm ci` succeeds |

---

## Rollback Plan

If the central workflow change breaks unrelated installs:

1. Revert the central workflow commit.
2. Keep the docs/runbook if they remain accurate for package access.
3. Temporarily unblock affected tribe repos by using a repo-local workflow patch with:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

4. Re-test the central patch on a pilot branch before re-releasing.

If the package access model becomes too hard to operate:

1. Create a short-lived `PACKAGES_READ_TOKEN` fallback design.
2. Scope the token to `read:packages`.
3. Store it as an org or repo secret only for affected repos.
4. Continue pursuing `GITHUB_TOKEN` package access as the preferred long-term model.

---

## Recommendation

Use the combined platform approach:

1. Standardize tribe `.npmrc`.
2. Patch central reusable workflows.
3. Grant package access per approved tribe repo.
4. Merge the central workflow fix to `main`.
5. Roll out tribe-by-tribe with a tracker.

Avoid a shared long-lived PAT unless GitHub Package repository access cannot satisfy the use case. The `GITHUB_TOKEN` path is cleaner because it keeps auth automatic, repo-scoped, and easier to revoke by removing package access.
