# Central Workflow Next Safety Phases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stronger consumer-safety checks after the current workflow validation hardening, without changing existing tribe pipeline behavior.

**Architecture:** Build guardrails before behavioral changes. First add fixture-based consumer simulations, then add release-tag discipline, then narrow permissions only when validation coverage proves the workflows still work. Keep documentation cleanup isolated from behavior changes.

**Tech Stack:** GitHub Actions reusable workflows, caller templates, YAML fixtures, PowerShell repository checks, Markdown documentation.

---

## File Structure

- Create: `fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml`
  - Fixture copy of the frontend caller used only for validation.
- Create: `fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml`
  - Fixture copy of the backend caller used only for validation.
- Create: `fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml`
  - Fixture copy of the mobile caller used only for validation.
- Create: `fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml`
  - Fixture copy of the Kotlin caller used only for validation.
- Create: `docs/consumer-fixture-validation.md`
  - Explains why fixtures exist and how to update them.
- Modify: `.github/workflows/workflow-validation.yml`
  - Add fixture validation checks.
- Create: `.github/workflows/release-reference-check.yml`
  - Manual workflow that checks readiness before moving or announcing `v1`.
- Create: `docs/v1-release-checklist.md`
  - Human checklist for moving `v1`.
- Later modify: selected `.github/workflows/*.yml`
  - Narrow one permission surface at a time after fixture validation is stable.

## Phase 1 - Consumer Fixture Simulation

This phase is validation-only. It must not change reusable workflow behavior.

### Task 1: Create Consumer Caller Fixtures

**Files:**
- Create: `fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml`
- Create: `fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml`
- Create: `fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml`
- Create: `fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml`

- [ ] **Step 1: Create fixture directories**

Run:

```powershell
New-Item -ItemType Directory -Force fixtures/consumer-callers/frontend/.github/workflows
New-Item -ItemType Directory -Force fixtures/consumer-callers/backend/.github/workflows
New-Item -ItemType Directory -Force fixtures/consumer-callers/mobile/.github/workflows
New-Item -ItemType Directory -Force fixtures/consumer-callers/kotlin/.github/workflows
```

Expected:

- All four fixture workflow directories exist.

- [ ] **Step 2: Copy current caller templates into fixtures**

Run:

```powershell
Copy-Item templates/fe-pipeline-caller.yml fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml
Copy-Item templates/be-pipeline-caller.yml fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml
Copy-Item templates/mobile-pipeline-caller.yml fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml
Copy-Item templates/mobile-kotlin-caller.yml fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml
```

Expected:

- Fixtures match the current templates at creation time.

- [ ] **Step 3: Verify fixture refs point to main**

Run:

```powershell
rg --hidden -n "ImplementSprint/central-workflow/.github/workflows/.+@main" fixtures/consumer-callers
```

Expected:

- Four matches, one per fixture.

- [ ] **Step 4: Verify no fixture points to old branches**

Run:

```powershell
rg --hidden -n "central-workflow/.+@(fix/e2e-policy|maestro)" fixtures/consumer-callers
```

Expected:

- Exit code `1`.
- No output.

### Task 2: Document Fixture Maintenance

**Files:**
- Create: `docs/consumer-fixture-validation.md`

- [ ] **Step 1: Create the fixture documentation**

Create `docs/consumer-fixture-validation.md`:

```markdown
# Consumer Fixture Validation

## Purpose

Consumer fixtures simulate how tribe repositories call `central-workflow` after copying the templates from `templates`.

The fixtures are not production workflows. They exist so validation can catch caller drift before a tribe copies a broken template.

## Fixture Layout

- `fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml`
- `fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml`
- `fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml`
- `fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml`

## Update Rule

When a file in `templates` changes, update the matching fixture in the same pull request.

## Validation Rule

The validation workflow must fail when a fixture drifts from its source template or points at a stale central-workflow branch.
```

- [ ] **Step 2: Verify the doc names all fixtures**

Run:

```powershell
rg -n "frontend|backend|mobile|kotlin" docs/consumer-fixture-validation.md
```

Expected:

- The command lists all four fixture areas.

### Task 3: Add Fixture Drift Validation

**Files:**
- Modify: `.github/workflows/workflow-validation.yml`

- [ ] **Step 1: Add fixtures to validation trigger paths**

Add this path under `pull_request.paths`:

```yaml
      - "fixtures/consumer-callers/**"
```

- [ ] **Step 2: Add a fixture drift validation job**

Add this job:

```yaml
  validate-consumer-fixtures:
    name: "Validate Consumer Caller Fixtures"
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout Code
        uses: actions/checkout@v5

      - name: Validate fixture copies match templates
        shell: bash
        run: |
          set -euo pipefail
          cmp templates/fe-pipeline-caller.yml fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml
          cmp templates/be-pipeline-caller.yml fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml
          cmp templates/mobile-pipeline-caller.yml fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml
          cmp templates/mobile-kotlin-caller.yml fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml

      - name: Validate fixture refs
        shell: bash
        run: |
          set -euo pipefail
          grep -RIn 'ImplementSprint/central-workflow/.github/workflows/.*@main' fixtures/consumer-callers
          if grep -RInE 'central-workflow/.+@(fix/e2e-policy|maestro)' fixtures/consumer-callers; then
            echo "Found stale central-workflow refs in consumer fixtures."
            exit 1
          fi
```

- [ ] **Step 3: Run local fixture checks**

Run:

```powershell
Compare-Object (Get-Content templates/fe-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml)
Compare-Object (Get-Content templates/be-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml)
Compare-Object (Get-Content templates/mobile-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml)
Compare-Object (Get-Content templates/mobile-kotlin-caller.yml) (Get-Content fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml)
```

Expected:

- No output from any `Compare-Object` command.

## Phase 2 - Release Discipline for v1

This phase protects tribes that pin to `@v1`. It must not move the tag automatically.

### Task 4: Create v1 Release Checklist

**Files:**
- Create: `docs/v1-release-checklist.md`

- [ ] **Step 1: Create the checklist**

Create `docs/v1-release-checklist.md`:

```markdown
# v1 Release Checklist

## Purpose

Use this checklist before moving the `v1` tag for `central-workflow`.

## Required Checks

- `git diff --check` passes.
- Workflow validation passes in GitHub Actions.
- Consumer fixture validation passes.
- Caller templates still point to the intended default reference.
- GitHub Packages SDK install guidance is still present.
- No literal package tokens are committed.
- Release notes include behavior changes, consumer action required, validation evidence, and rollback path.

## Approval Rule

Do not move `v1` without owner approval and a written release note.

## Rollback Rule

If consumers break after a `v1` move, pin affected consumers to the previous known-good SHA or move them back to `@main` while the issue is fixed.
```

- [ ] **Step 2: Link checklist from release policy**

Add this line to `docs/release-reference-policy.md` under `## Moving a Stable Tag`:

```markdown
Use `docs/v1-release-checklist.md` as the required release checklist.
```

### Task 5: Add Manual Release Reference Check Workflow

**Files:**
- Create: `.github/workflows/release-reference-check.yml`

- [ ] **Step 1: Create manual check workflow**

Create `.github/workflows/release-reference-check.yml`:

```yaml
name: "Release Reference Check"

on:
  workflow_dispatch:
    inputs:
      target-ref:
        description: "Commit SHA or branch to validate before moving v1"
        required: true
        type: string

permissions:
  contents: read

jobs:
  release-check:
    name: "Validate Release Reference"
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout target ref
        uses: actions/checkout@v5
        with:
          ref: ${{ inputs.target-ref }}

      - name: Check required docs
        shell: bash
        run: |
          set -euo pipefail
          test -f docs/release-reference-policy.md
          test -f docs/v1-release-checklist.md
          test -f docs/workflow-contract-registry.md
          test -f docs/consumer-fixture-validation.md

      - name: Check stale refs
        shell: bash
        run: |
          set -euo pipefail
          if grep -RInE 'central-workflow/.+@(fix/e2e-policy|maestro)' templates docs fixtures .github/workflows; then
            echo "Found stale central-workflow refs."
            exit 1
          fi

      - name: Check package token safety
        shell: bash
        run: |
          set -euo pipefail
          ghp_prefix='ghp''_'
          github_pat_prefix='github''_pat_'
          npm_token_pattern='npm_''[A-Za-z0-9]'
          if grep -RInE --exclude='workflow-validation.yml' --exclude='release-reference-check.yml' --exclude-dir='superpowers' "$ghp_prefix|$github_pat_prefix|$npm_token_pattern" docs templates fixtures .github/workflows; then
            echo "Found a literal token-like value."
            exit 1
          fi
```

- [ ] **Step 2: Verify release workflow contains no write permission**

Run:

```powershell
rg -n "contents: write|packages: write|pull-requests: write|security-events: write" .github/workflows/release-reference-check.yml
```

Expected:

- Exit code `1`.
- No write permissions.

## Phase 3 - Permission Minimization

This phase can break workflows if done carelessly. Change one workflow at a time.

### Task 6: Inventory Write Permissions

**Files:**
- Create: `docs/workflow-permission-review.md`

- [ ] **Step 1: Capture current write permissions**

Run:

```powershell
rg -n "contents: write|packages: write|pull-requests: write|security-events: write" .github/workflows templates
```

Expected:

- Output lists workflows and templates using write permissions.

- [ ] **Step 2: Create permission review doc**

Create `docs/workflow-permission-review.md`:

```markdown
# Workflow Permission Review

## Purpose

This document tracks which workflow write permissions are required and which can be narrowed safely.

## Review Rules

- Change one workflow at a time.
- Do not narrow permissions used for releases, package publishing, SARIF upload, PR comments, or promotion PRs.
- Prefer job-level permissions over broad workflow-level permissions when the workflow already uses job boundaries.

## Current Categories

| Permission | Usually Required For |
| --- | --- |
| `contents: write` | version tags, release commits, auto-revert commits, release publishing |
| `packages: write` | Docker or package publishing |
| `pull-requests: write` | promotion PRs, PR comments |
| `security-events: write` | SARIF upload |
```

### Task 7: Narrow One Low-Risk Workflow

**Files:**
- Modify: one selected `.github/workflows/*.yml`

- [ ] **Step 1: Choose one workflow with clear evidence**

Use the inventory from Task 6.

Proceed only if the selected workflow has a write permission that is not used by any job in that file.

- [ ] **Step 2: Modify one permission**

Example:

```yaml
permissions:
  contents: read
```

- [ ] **Step 3: Run local checks**

Run:

```powershell
git diff --check
rg -n "permissions:" .github/workflows/<selected-workflow>.yml
```

Expected:

- No whitespace errors.
- Permission blocks remain explicit.

## Phase 4 - Documentation Cleanup

This phase is useful but should stay separate because it can create noisy diffs.

### Task 8: Normalize Encoding Artifacts in Docs Only

**Files:**
- Modify: selected `.md` files only

- [ ] **Step 1: Find corrupted characters in docs**

Run:

```powershell
rg -n --glob "*.md" "â|�" docs GIT_WORKFLOW.md RULES_AND_GUIDELINES.md DESCOPE_README.md MOBILE_PIPELINE_PRESETS_AND_PROMPT.md
```

Expected:

- Output lists Markdown files with corrupted characters, or exits `1` if none are found.

- [ ] **Step 2: Pick one doc file**

Choose one Markdown file and fix only corrupted characters in that file.

- [ ] **Step 3: Verify doc-only diff**

Run:

```powershell
git diff --name-only
git diff --check
```

Expected:

- Only intended docs changed in this task.
- No whitespace errors.

## Final Verification

- [ ] **Step 1: Run whitespace check**

Run:

```powershell
git diff --check
```

Expected:

- No whitespace errors.

- [ ] **Step 2: Run stale ref audit**

Run:

```powershell
rg --hidden -n "central-workflow/.+@(fix/e2e-policy|maestro)" templates docs fixtures .github/workflows
```

Expected:

- Exit code `1`.
- No stale branch refs.

- [ ] **Step 3: Run token audit**

Run:

```powershell
rg --hidden -n --glob "!docs/superpowers/plans/**" --glob "!.github/workflows/workflow-validation.yml" --glob "!.github/workflows/release-reference-check.yml" "ghp_|github_pat_|npm_[A-Za-z0-9]" docs templates fixtures .github/workflows
```

Expected:

- Exit code `1`.
- No literal package tokens.

- [ ] **Step 4: Verify fixture drift**

Run:

```powershell
Compare-Object (Get-Content templates/fe-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/frontend/.github/workflows/master-pipeline-fe.yml)
Compare-Object (Get-Content templates/be-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/backend/.github/workflows/master-pipeline-be.yml)
Compare-Object (Get-Content templates/mobile-pipeline-caller.yml) (Get-Content fixtures/consumer-callers/mobile/.github/workflows/master-pipeline-mobile.yml)
Compare-Object (Get-Content templates/mobile-kotlin-caller.yml) (Get-Content fixtures/consumer-callers/kotlin/.github/workflows/mobile-kotlin-caller.yml)
```

Expected:

- No output from any command.

## Recommended Execution Order

1. Phase 1: consumer fixture simulation.
2. Phase 2: release discipline for `v1`.
3. Phase 3: permission minimization, one workflow at a time.
4. Phase 4: documentation cleanup in separate docs-only changes.

Do not move `v1` as part of this plan. Do not change consumer templates away from `@main` as part of this plan.
