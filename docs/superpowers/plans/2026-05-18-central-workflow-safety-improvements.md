# Central Workflow Safety Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve `central-workflow` reliability and tribe onboarding safety without breaking existing reusable workflow consumers.

**Architecture:** Start with documentation and validation guardrails, then make narrowly scoped CI hardening changes only after the repo can detect drift. Keep behavior-sensitive workflow changes isolated by phase, and avoid broad refactors until consumer contracts are documented and checked.

**Tech Stack:** GitHub Actions reusable workflows, PowerShell validation scripts, ripgrep-based repository checks, Markdown documentation.

---

## File Structure

- Create: `docs/workflow-contract-registry.md`
  - Central table of reusable workflow contracts: workflow name, caller path, inputs, secrets, permissions, package-manager behavior, artifacts, and consumer notes.
- Create: `docs/release-reference-policy.md`
  - Policy explaining when tribes should use `@main` versus `@v1`, who can approve tag movement, and how release announcements should work.
- Create: `docs/tribe-github-packages-onboarding.md`
  - Checklist for teams consuming `@implementsprint/sdk` through GitHub Packages in CI.
- Modify: `.github/workflows/workflow-validation.yml`
  - Add validation checks for caller templates, stale refs, package auth guidance, mutable Docker tags, and documentation/template drift.
- Modify: `docs/central-workflow-improvement-decisions.md`
  - Link to the new implementation documents after they exist.
- Later modify: `.github/workflows/workflow-validation.yml`
  - Pin `actionlint` away from `docker://rhysd/actionlint:latest` after validation checks prove stable.
- Later modify: selected `.github/workflows/*.yml`
  - Standardize artifact action versions and narrow permissions one family at a time.

## Phase 1 - Documentation and Read-Only Validation

This phase must not change reusable workflow behavior.

### Task 1: Create Workflow Contract Registry

**Files:**
- Create: `docs/workflow-contract-registry.md`

- [ ] **Step 1: Inventory reusable workflows**

Run:

```powershell
rg -n "on:\s*$|workflow_call:|inputs:|secrets:|permissions:" .github/workflows
```

Expected:

- Output lists the reusable workflow call surfaces.
- No file edits yet.

- [ ] **Step 2: Create the registry document**

Create `docs/workflow-contract-registry.md` with this structure:

```markdown
# Workflow Contract Registry

## Purpose

This registry documents the public contract of reusable workflows in `central-workflow` so consuming tribes know which caller template, inputs, secrets, permissions, and package setup each workflow expects.

## Contract Rules

- Treat every `workflow_call` input as a public contract.
- Treat required secrets and permissions as consumer setup requirements.
- Keep caller templates and docs aligned with this registry.
- Do not remove or rename an input without a migration note.

## Workflows

| Area | Workflow | Caller Template | Required Inputs | Optional Inputs | Required Secrets | Required Permissions | Package/Auth Notes | Artifacts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Frontend | `.github/workflows/master-pipeline-fe.yml` | `templates/fe-pipeline-caller.yml` | Repository-specific caller inputs from the workflow file | Repository-specific optional inputs from the workflow file | Secrets declared in the workflow file | Permissions declared in the workflow file | Uses npm install lanes with GitHub Packages auth where SDK packages are present | See workflow artifact upload steps |
| Backend | `.github/workflows/master-pipeline-be.yml` | `templates/be-pipeline-caller.yml` | Repository-specific caller inputs from the workflow file | Repository-specific optional inputs from the workflow file | Secrets declared in the workflow file | Permissions declared in the workflow file | Uses npm install lanes with GitHub Packages auth where SDK packages are present | See workflow artifact upload steps |
| Mobile | `.github/workflows/master-pipeline-mobile.yml` | `templates/mobile-pipeline-caller.yml` | Repository-specific caller inputs from the workflow file | Repository-specific optional inputs from the workflow file | Secrets declared in the workflow file | Permissions declared in the workflow file | Uses mobile package install and build lanes | See workflow artifact upload steps |
| Kotlin | `.github/workflows/master-pipeline-kotlin.yml` | `templates/mobile-kotlin-caller.yml` | Repository-specific caller inputs from the workflow file | Repository-specific optional inputs from the workflow file | Secrets declared in the workflow file | Permissions declared in the workflow file | Uses Gradle/Kotlin lanes | See workflow artifact upload steps |

## Maintenance Checklist

- Update this file when adding, renaming, or removing workflow inputs.
- Update this file when changing required secrets or permissions.
- Update the matching template in `templates`.
- Run `.github/workflows/workflow-validation.yml` checks in CI.
```

- [ ] **Step 3: Verify the document is placeholder-free**

Run:

```powershell
$patterns = @('TB' + 'D', 'TO' + 'DO', 'fill' + ' in', 'implement' + ' later')
Select-String -Path docs/workflow-contract-registry.md -Pattern $patterns
```

Expected:

- No output.

- [ ] **Step 4: Commit the registry**

Run:

```powershell
git add docs/workflow-contract-registry.md
git commit -m "docs: add workflow contract registry"
```

Expected:

- Commit succeeds.

### Task 2: Add Release Reference Policy

**Files:**
- Create: `docs/release-reference-policy.md`

- [ ] **Step 1: Create the policy document**

Create `docs/release-reference-policy.md`:

```markdown
# Release Reference Policy

## Purpose

This policy explains how consuming tribes should choose between `@main` and stable tags such as `@v1` when calling workflows from `central-workflow`.

## Default Reference

Use `@main` when a tribe wants the latest shared workflow fixes and accepts that central workflow behavior may improve over time.

Current caller templates use `@main` by default.

## Stable Reference

Use `@v1` when a tribe needs a pinned, stable workflow reference for controlled releases.

`v1` must not be moved casually. Moving `v1` changes every consumer pinned to that tag.

## Moving a Stable Tag

Before moving `v1`, complete all of these checks:

- `git diff --check`
- Workflow validation passes in GitHub Actions.
- Caller templates still point to the intended reference.
- SDK install auth checks still pass.
- Release notes list behavior changes, required consumer changes, and rollback instructions.

## Announcement Template

Use this announcement format before moving `v1`:

```text
central-workflow v1 update

New target commit:
Summary of changes:
Consumer action required:
Validation completed:
Rollback path:
Owner:
```

## Rollback

If a stable tag causes consumer breakage, move affected consumers back to the previous tag or to a known-good commit SHA while the central workflow issue is fixed.
```

- [ ] **Step 2: Verify current references**

Run:

```powershell
rg -n "uses: .*central-workflow/.+@(main|v1)" templates docs
```

Expected:

- Caller templates show `@main`.
- Policy documentation may mention `@v1`.

- [ ] **Step 3: Commit the policy**

Run:

```powershell
git add docs/release-reference-policy.md
git commit -m "docs: define workflow release reference policy"
```

Expected:

- Commit succeeds.

### Task 3: Add Tribe GitHub Packages Onboarding Checklist

**Files:**
- Create: `docs/tribe-github-packages-onboarding.md`

- [ ] **Step 1: Create the onboarding document**

Create `docs/tribe-github-packages-onboarding.md`:

```markdown
# Tribe GitHub Packages Onboarding

## Purpose

This checklist helps a tribe install `@implementsprint/sdk` from GitHub Packages in CI without committing tokens or confusing install-time auth with runtime API auth.

## Required Repository Setup

- The tribe repository must have access to the GitHub Package that hosts `@implementsprint/sdk`.
- The workflow must grant `packages: read`.
- The npm install step must receive `NODE_AUTH_TOKEN` or `GITHUB_TOKEN`.
- The repository must map the `@implementsprint` scope to GitHub Packages.

## Recommended `.npmrc`

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

## CI Install Requirements

GitHub Actions install jobs should include:

```yaml
permissions:
  contents: read
  packages: read

env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Common Failure

`npm ERR! 401 Unauthorized` from `npm.pkg.github.com` usually means one of these is missing:

- The package is not granted to the consuming repository.
- `packages: read` is missing.
- The token is not available to npm.
- The `@implementsprint` registry mapping is missing.

## Important Boundary

`GITHUB_TOKEN` is install-time package auth. Runtime API Center authentication uses separate runtime environment variables and should not be replaced by npm package auth.
```

- [ ] **Step 2: Verify token safety**

Run:

```powershell
$patterns = @('ghp' + '_', 'github' + '_pat_', 'npm_' + '[A-Za-z0-9]')
rg -n -e $patterns[0] -e $patterns[1] -e $patterns[2] docs/tribe-github-packages-onboarding.md
```

Expected:

- Exit code `1`.
- No literal tokens are present.

- [ ] **Step 3: Commit the checklist**

Run:

```powershell
git add docs/tribe-github-packages-onboarding.md
git commit -m "docs: add github packages onboarding checklist"
```

Expected:

- Commit succeeds.

### Task 4: Link Decision Record to New Documents

**Files:**
- Modify: `docs/central-workflow-improvement-decisions.md`

- [ ] **Step 1: Add a related documents section**

Append this section before `## Recommended Next Step`:

```markdown
## Related Implementation Documents

- `docs/workflow-contract-registry.md`
- `docs/release-reference-policy.md`
- `docs/tribe-github-packages-onboarding.md`
- `docs/superpowers/plans/2026-05-18-central-workflow-safety-improvements.md`
```

- [ ] **Step 2: Verify links point to real files**

Run:

```powershell
Test-Path docs/workflow-contract-registry.md
Test-Path docs/release-reference-policy.md
Test-Path docs/tribe-github-packages-onboarding.md
Test-Path docs/superpowers/plans/2026-05-18-central-workflow-safety-improvements.md
```

Expected:

```text
True
True
True
True
```

- [ ] **Step 3: Commit the decision-record link update**

Run:

```powershell
git add docs/central-workflow-improvement-decisions.md
git commit -m "docs: link workflow improvement plan artifacts"
```

Expected:

- Commit succeeds.

## Phase 2 - Validation Guardrails

This phase adds checks but should not change how consumers run workflows.

### Task 5: Add Caller Reference Validation

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Inspect existing validation style**

Run:

```powershell
Get-Content .github/workflows/workflow-validation.yml
```

Expected:

- Existing caller-template checks are visible.
- Keep the same shell style already used by the workflow.

- [ ] **Step 2: Add a stale-reference check**

Add a validation step that fails if active templates or docs point at removed branch refs:

```yaml
      - name: Validate central workflow refs
        shell: bash
        run: |
          set -euo pipefail
          if grep -RInE 'central-workflow/.+@(fix/e2e-policy|maestro)' templates docs .github/workflows; then
            echo "Found stale central-workflow branch refs."
            exit 1
          fi
```

- [ ] **Step 3: Run local text check**

Run:

```powershell
rg -n "central-workflow/.+@(fix/e2e-policy|maestro)" templates docs .github/workflows
```

Expected:

- Exit code `1`.
- No active stale refs.

- [ ] **Step 4: Commit the validation change**

Run:

```powershell
git add .github/workflows/workflow-validation.yml
git commit -m "ci: validate central workflow references"
```

Expected:

- Commit succeeds.

### Task 6: Add SDK Package Auth Validation

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Add docs token-safety check**

Add this validation step:

```yaml
      - name: Validate no literal package tokens are documented
        shell: bash
        run: |
          set -euo pipefail
          ghp_prefix='ghp''_'
          github_pat_prefix='github''_pat_'
          npm_token_pattern='npm_''[A-Za-z0-9]'
          if grep -RInE --exclude='workflow-validation.yml' --exclude-dir='superpowers' "$ghp_prefix|$github_pat_prefix|$npm_token_pattern" docs templates .github/workflows; then
            echo "Found a literal token-like value in repo docs/templates/workflows."
            exit 1
          fi
```

- [ ] **Step 2: Add SDK auth guidance check**

Add this validation step:

```yaml
      - name: Validate GitHub Packages SDK guidance
        shell: bash
        run: |
          set -euo pipefail
          grep -RIn '@implementsprint:registry=https://npm.pkg.github.com' docs templates .github/workflows
          grep -RIn 'GITHUB_TOKEN' docs templates .github/workflows
          grep -RIn 'packages: read' .github/workflows
```

- [ ] **Step 3: Run local equivalent checks**

Run:

```powershell
$patterns = @('ghp' + '_', 'github' + '_pat_', 'npm_' + '[A-Za-z0-9]')
rg -n --glob '!docs/superpowers/plans/**' --glob '!.github/workflows/workflow-validation.yml' -e $patterns[0] -e $patterns[1] -e $patterns[2] docs templates .github/workflows
rg -n "@implementsprint:registry=https://npm.pkg.github.com" docs templates .github/workflows
rg -n "GITHUB_TOKEN" docs templates .github/workflows
rg -n "packages: read" .github/workflows
```

Expected:

- First command exits `1`.
- Remaining commands find expected package-auth guidance.

- [ ] **Step 4: Commit the SDK validation**

Run:

```powershell
git add .github/workflows/workflow-validation.yml
git commit -m "ci: validate github packages sdk guidance"
```

Expected:

- Commit succeeds.

### Task 7: Add Documentation Drift Validation

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Add required documentation check**

Add this validation step:

```yaml
      - name: Validate required workflow docs exist
        shell: bash
        run: |
          set -euo pipefail
          test -f docs/workflow-contract-registry.md
          test -f docs/release-reference-policy.md
          test -f docs/tribe-github-packages-onboarding.md
          test -f docs/central-workflow-improvement-decisions.md
```

- [ ] **Step 2: Add release-reference consistency check**

Add this validation step:

```yaml
      - name: Validate caller templates use main by default
        shell: bash
        run: |
          set -euo pipefail
          grep -RIn 'Tone-Lloyd-Sir-Catubag-CICD/central-workflow/.github/workflows/.*@main' templates
```

- [ ] **Step 3: Run local syntax check**

Run:

```powershell
git diff --check
```

Expected:

- No whitespace errors.

- [ ] **Step 4: Commit documentation drift validation**

Run:

```powershell
git add .github/workflows/workflow-validation.yml
git commit -m "ci: validate workflow documentation contracts"
```

Expected:

- Commit succeeds.

## Phase 3 - Targeted CI Hardening

Each task in this phase should be a separate PR or commit series. Do not combine unrelated hardening changes.

### Task 8: Pin Actionlint Validation Dependency

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Find the mutable actionlint reference**

Run:

```powershell
rg -n "rhysd/actionlint:latest|docker://.*:latest" .github/workflows/workflow-validation.yml
```

Expected:

- Finds the current mutable Docker action reference.

- [ ] **Step 2: Choose a specific actionlint version**

Use a reviewed actionlint release version and replace `docker://rhysd/actionlint:latest` with that exact version.

Example target format:

```yaml
uses: docker://rhysd/actionlint:1.7.12
```

- [ ] **Step 3: Verify no mutable Docker action remains in validation**

Run:

```powershell
rg -n "docker://.*:latest" .github/workflows/workflow-validation.yml
```

Expected:

- Exit code `1`.
- No output.

- [ ] **Step 4: Commit the pin**

Run:

```powershell
git add .github/workflows/workflow-validation.yml
git commit -m "ci: pin actionlint validation image"
```

Expected:

- Commit succeeds.

### Task 9: Standardize Artifact Action Versions

**Files:**
- Modify: selected `.github/workflows/*.yml`

- [ ] **Step 1: Inventory artifact action versions**

Run:

```powershell
rg -n "actions/(upload-artifact|download-artifact)@" .github/workflows
```

Expected:

- Output shows every artifact action version currently used.

- [ ] **Step 2: Select one action family**

Start with either upload or download actions, not both.

Decision rule:

- If both old and new major versions are present, choose the newer version already used in the repo unless release notes show a breaking incompatibility.
- Do not change retention, artifact names, or paths in the same commit.

- [ ] **Step 3: Update only the selected action family**

Example if standardizing upload actions:

```yaml
uses: actions/upload-artifact@v6
```

- [ ] **Step 4: Verify the remaining version inventory**

Run:

```powershell
rg -n "actions/upload-artifact@|actions/download-artifact@" .github/workflows
git diff --check
```

Expected:

- Only the selected action family changed.
- No whitespace errors.

- [ ] **Step 5: Commit the action-family update**

Run:

```powershell
git add .github/workflows
git commit -m "ci: standardize artifact upload action version"
```

Expected:

- Commit succeeds.

### Task 10: Review Broad Workflow Permissions

**Files:**
- Modify: one selected `.github/workflows/*.yml` per commit

- [ ] **Step 1: Inventory broad permissions**

Run:

```powershell
rg -n "contents: write|packages: write|pull-requests: write|security-events: write" .github/workflows
```

Expected:

- Output identifies workflows with write permissions.

- [ ] **Step 2: Pick one workflow**

Choose one workflow where permissions can be narrowed with clear evidence from the jobs in that file.

Do not modify multiple master pipelines in the same commit.

- [ ] **Step 3: Lower one permission only when usage proves safe**

Example:

```yaml
permissions:
  contents: read
  packages: read
```

Only make this edit if the workflow does not publish packages, create releases, comment on pull requests, upload SARIF, or write repository contents.

- [ ] **Step 4: Run local checks**

Run:

```powershell
git diff --check
rg -n "permissions:" .github/workflows
```

Expected:

- No whitespace errors.
- Permission blocks remain explicit.

- [ ] **Step 5: Commit the single-workflow permission change**

Run:

```powershell
git add .github/workflows/<selected-workflow>.yml
git commit -m "ci: narrow permissions for <selected-workflow>"
```

Expected:

- Commit succeeds.

## Phase 4 - Documentation Cleanup and Maintainability

This phase should be done only after Phases 1 and 2 are merged and stable.

### Task 11: Normalize Documentation Encoding Artifacts

**Files:**
- Modify: selected `.md` files only

- [ ] **Step 1: Find encoding artifacts**

Run:

```powershell
rg -n "â|�" *.md docs .github/workflows
```

Expected:

- Output lists files with corrupted characters.

- [ ] **Step 2: Pick documentation-only files first**

Start with Markdown files. Do not edit workflow YAML comments in the same commit as docs unless the diff is clearly comment-only.

- [ ] **Step 3: Replace corrupted characters with ASCII equivalents**

Use these replacements:

```text
â€” -> -
â†’ -> ->
â€™ -> '
â€œ -> "
â€� -> "
```

- [ ] **Step 4: Verify no behavior files changed unexpectedly**

Run:

```powershell
git diff --name-only
git diff --check
```

Expected:

- Only intended docs changed.
- No whitespace errors.

- [ ] **Step 5: Commit the docs cleanup**

Run:

```powershell
git add <selected-doc-files>
git commit -m "docs: normalize workflow documentation encoding"
```

Expected:

- Commit succeeds.

### Task 12: Evaluate Shared Install Setup Only After Drift Checks Exist

**Files:**
- Create only if justified: `.github/actions/setup-node-github-packages/action.yml`
- Modify only if justified: selected `.github/workflows/*.yml`

- [ ] **Step 1: Count duplicated SDK install setup**

Run:

```powershell
rg -n "@implementsprint:registry|NODE_AUTH_TOKEN|packages: read" .github/workflows
```

Expected:

- Output shows every install lane that contains SDK package auth setup.

- [ ] **Step 2: Decide whether abstraction is justified**

Proceed only if at least three workflows share identical setup and validation covers all of them.

Do not create a shared action if workflows differ in package manager, working directory, or token source.

- [ ] **Step 3: If justified, create a composite action**

Create `.github/actions/setup-node-github-packages/action.yml`:

```yaml
name: Setup Node for GitHub Packages
description: Configure Node.js and npm auth for GitHub Packages installs.
inputs:
  node-version:
    description: Node.js version to use.
    required: false
    default: "20"
runs:
  using: composite
  steps:
    - name: Setup Node
      uses: actions/setup-node@v5
      with:
        node-version: ${{ inputs.node-version }}
        registry-url: https://npm.pkg.github.com
        scope: "@implementsprint"
```

- [ ] **Step 4: Replace one workflow first**

Modify one low-risk workflow to use the composite action.

Do not update every workflow in the first commit.

- [ ] **Step 5: Commit the pilot abstraction**

Run:

```powershell
git add .github/actions/setup-node-github-packages/action.yml .github/workflows/<selected-workflow>.yml
git commit -m "ci: pilot shared github packages node setup"
```

Expected:

- Commit succeeds.

## Final Verification

- [ ] **Step 1: Run repository whitespace check**

Run:

```powershell
git diff --check
```

Expected:

- No whitespace errors.

- [ ] **Step 2: Run reference audit**

Run:

```powershell
rg -n "central-workflow/.+@(fix/e2e-policy|maestro)" templates docs .github/workflows
```

Expected:

- Exit code `1`.
- No stale branch refs.

- [ ] **Step 3: Run package token audit**

Run:

```powershell
$patterns = @('ghp' + '_', 'github' + '_pat_', 'npm_' + '[A-Za-z0-9]')
rg -n --glob '!docs/superpowers/plans/**' --glob '!.github/workflows/workflow-validation.yml' -e $patterns[0] -e $patterns[1] -e $patterns[2] docs templates .github/workflows
```

Expected:

- Exit code `1`.
- No literal tokens.

- [ ] **Step 4: Run mutable validation dependency audit**

Run:

```powershell
rg -n "docker://.*:latest" .github/workflows/workflow-validation.yml
```

Expected after Task 8:

- Exit code `1`.
- No mutable Docker image tags in workflow validation.

- [ ] **Step 5: Push branch**

Run:

```powershell
git push
```

Expected:

- Branch pushes successfully.
- GitHub Actions validation starts on the pushed commit.

## Execution Notes

- Keep Phase 1 documentation commits separate from Phase 2 validation commits.
- Keep each Phase 3 hardening change isolated so rollback is simple.
- Do not move `v1` as part of this plan.
- Do not change consumer templates away from `@main` as part of this plan.
- If any validation check fails because existing docs are stale, fix the documentation first instead of weakening the check.
