# Tribe Backend Authorized Commit Date Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the authorized backend branch histories so the NestJS monorepo microservices conversion commits are dated within the assignment date window instead of the current rewrite date.

**Architecture:** Treat each tribe backend repo as an independent history-rewrite unit. Preserve the current two-commit public shape (`HEAD~1` conversion, `HEAD` fixes), rebuild those two commits with authorized assignment dates, and force-push with `--force-with-lease` only after verification.

**Tech Stack:** Git, GitHub CLI (`gh`), PowerShell, GitHub Actions reusable backend workflows.

---

## Assignment Constraint

This plan is for an authorized school-project history rewrite exercise. The target date range is:

```text
May 11-12, 2026
Timezone: Asia/Manila (+08:00)
```

Use this tribe backend date mapping unless the user changes it before execution:

```text
HEAD~1 conversion commit: 2026-05-11T10:00:00+08:00
HEAD fix commit:         2026-05-12T16:00:00+08:00
```

Use this template backend date mapping:

```text
HEAD~1 conversion commit: 2026-05-10T10:00:00+08:00
HEAD fix commit:         2026-05-10T16:00:00+08:00
```

The user will maintain any private local audit note outside the repository. Do not create or commit that audit note in this repo.

## Scope

### Included Repositories

```text
C:\Codes\secret-ops\campus-one-be
C:\Codes\secret-ops\greenovate-be
C:\Codes\secret-ops\paki-apps-be
C:\Codes\secret-ops\sho-team-be
C:\Codes\secret-ops\smurf-village-be
C:\Codes\secret-ops\template-repo-be-nest
C:\Codes\secret-ops\trini-thrive-be
```

### Included Branches

Current local inventory:

| Repo | Branches to rewrite |
| --- | --- |
| `campus-one-be` | all remote branches currently discovered: `main`, `test`, `uat` |
| `greenovate-be` | all remote branches currently discovered: `main`, `test`, `uat` |
| `paki-apps-be` | all remote branches currently discovered: `main`, `test`, `uat` |
| `sho-team-be` | all remote branches currently discovered: `main`, `test`, `uat` |
| `smurf-village-be` | all remote branches currently discovered: `main`, `test`, `uat` |
| `template-repo-be-nest` | all remote branches currently discovered: `main`, `test`, `uat` |
| `trini-thrive-be` | only `main`, `test`, `uat` |

Explicitly excluded for `trini-thrive-be`:

```text
Develop
feat/hopecard-integration
```

If a fetch reveals new non-standard branches in Campus, Greenovate, Paki, Sho, Smurf, or Template before execution, pause and classify them before pushing. The current branch inventory only shows `main`, `test`, and `uat` for those six repos.

## Current Canonical Heads

These are the current branch heads before date rewriting:

| Repo | Current fix commit (`HEAD`) | Current conversion commit (`HEAD~1`) |
| --- | --- | --- |
| `campus-one-be` | `f739dd9` | `bffc316` |
| `greenovate-be` | `7f12da8` | `e2cbfbd` |
| `paki-apps-be` | `50a9fe0` | `0842708` |
| `sho-team-be` | `fa8ac21` | `8dabd66` |
| `smurf-village-be` | `e877c59` | `a844be6` |
| `template-repo-be-nest` | `ef7b634` | `28af688` |
| `trini-thrive-be` | `05912a4` | `73ecd8c` |

Expected final shape after execution:

```text
HEAD~1: feat: convert backend to NestJS monorepo microservices
HEAD:   fix: harden backend monorepo runtime and CI wiring
```

Both commits must show author and committer dates inside May 11-12, 2026.

---

## Phase 1: Preflight Inventory

### Task 1: Refresh and Verify Branch Scope

**Files:**
- No file changes.

- [ ] **Step 1: Fetch current remote refs**

Run once per repo:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  git fetch --prune origin
  Pop-Location
}
```

Expected: fetch completes without rejected refs.

- [ ] **Step 2: Print remote branch inventory**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git branch -r --format='%(refname:short)' |
    Where-Object { $_ -notmatch 'origin/HEAD' -and $_ -ne 'origin' } |
    Sort-Object
  Pop-Location
}
```

Expected:
- Campus, Greenovate, Paki, Sho, Smurf, and Template show only the branches to be rewritten.
- Trini may show extra branches, but only `origin/main`, `origin/test`, and `origin/uat` are in scope.

- [ ] **Step 3: Confirm standard branch heads match per repo**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git rev-parse --short origin/main
  git rev-parse --short origin/test
  git rev-parse --short origin/uat
  Pop-Location
}
```

Expected: each repo prints the same short SHA three times. If a repo does not, stop and inspect that repo before rewriting.

---

## Phase 2: Local Safety Snapshot

### Task 2: Create Local Backup Refs

**Files:**
- No repo file changes.
- Git refs only.

- [ ] **Step 1: Create local backup refs for included branches**

Run:

```powershell
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  foreach ($branch in @('main','test','uat')) {
    git update-ref "refs/backup-authorized-date-rewrite-$timestamp-$branch" "origin/$branch"
  }
  Pop-Location
}
```

Expected: command exits successfully and does not push backup refs to GitHub.

- [ ] **Step 2: Verify backup refs exist locally**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git show-ref | Select-String 'refs/backup-authorized-date-rewrite'
  Pop-Location
}
```

Expected: each repo shows backup refs for `main`, `test`, and `uat`.

---

## Phase 3: Rebuild Two-Commit History With May 11-12 Dates

### Task 3: Recreate the Conversion and Fix Commits

**Files:**
- No working-tree file edits.
- Git commit objects are recreated with new author and committer dates.

- [ ] **Step 1: Rebuild dated commits locally**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)

$conversionDate = '2026-05-11T10:00:00+08:00'
$fixDate = '2026-05-12T16:00:00+08:00'
$templateConversionDate = '2026-05-10T10:00:00+08:00'
$templateFixDate = '2026-05-10T16:00:00+08:00'

foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"

  git checkout main

  $base = git rev-parse HEAD~2
  $conversionTree = git rev-parse 'HEAD~1^{tree}'
  $fixTree = git rev-parse 'HEAD^{tree}'

  $conversionSubject = git log -1 --format=%s HEAD~1
  $fixSubject = git log -1 --format=%s HEAD

  if ($conversionSubject -ne 'feat: convert backend to NestJS monorepo microservices') {
    throw "$repo conversion subject mismatch: $conversionSubject"
  }
  if ($fixSubject -ne 'fix: harden backend monorepo runtime and CI wiring') {
    throw "$repo fix subject mismatch: $fixSubject"
  }

  $repoConversionDate = if ($repo -eq 'template-repo-be-nest') { $templateConversionDate } else { $conversionDate }
  $repoFixDate = if ($repo -eq 'template-repo-be-nest') { $templateFixDate } else { $fixDate }

  $env:GIT_AUTHOR_NAME = git log -1 --format=%an HEAD~1
  $env:GIT_AUTHOR_EMAIL = git log -1 --format=%ae HEAD~1
  $env:GIT_AUTHOR_DATE = $repoConversionDate
  $env:GIT_COMMITTER_NAME = git log -1 --format=%cn HEAD~1
  $env:GIT_COMMITTER_EMAIL = git log -1 --format=%ce HEAD~1
  $env:GIT_COMMITTER_DATE = $repoConversionDate
  $conversionMessage = git log -1 --format=%B HEAD~1
  $newConversion = $conversionMessage | git commit-tree $conversionTree -p $base

  $env:GIT_AUTHOR_NAME = git log -1 --format=%an HEAD
  $env:GIT_AUTHOR_EMAIL = git log -1 --format=%ae HEAD
  $env:GIT_AUTHOR_DATE = $repoFixDate
  $env:GIT_COMMITTER_NAME = git log -1 --format=%cn HEAD
  $env:GIT_COMMITTER_EMAIL = git log -1 --format=%ce HEAD
  $env:GIT_COMMITTER_DATE = $repoFixDate
  $fixMessage = git log -1 --format=%B HEAD
  $newFix = $fixMessage | git commit-tree $fixTree -p $newConversion

  git update-ref refs/heads/main $newFix
  git update-ref refs/heads/test $newFix
  git update-ref refs/heads/uat $newFix

  Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

  "$repo -> $newFix"
  git log --pretty=fuller --date=iso-strict -2

  Pop-Location
}
```

Expected:
- Each repo prints a new fix commit SHA.
- `AuthorDate` and `CommitDate` for tribe backend `HEAD~1` are `2026-05-11T10:00:00+08:00`.
- `AuthorDate` and `CommitDate` for tribe backend `HEAD` are `2026-05-12T16:00:00+08:00`.
- `AuthorDate` and `CommitDate` for template backend `HEAD~1` are `2026-05-10T10:00:00+08:00`.
- `AuthorDate` and `CommitDate` for template backend `HEAD` are `2026-05-10T16:00:00+08:00`.

- [ ] **Step 2: Verify the tree did not change**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git diff --stat origin/main..main
  git diff --name-status origin/main..main
  Pop-Location
}
```

Expected: only commit metadata changed. These commands should produce no file changes.

---

## Phase 4: Push Rewritten Branches

### Task 4: Force-With-Lease Push Included Branches

**Files:**
- No working-tree file changes.
- Remote branches are rewritten.

- [ ] **Step 1: Push rewritten branches**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  git push --force-with-lease origin main:test main:uat main:main
  Pop-Location
}
```

Expected:
- Each repo updates `main`, `test`, and `uat`.
- No push uses plain `--force`.
- Trini extra branches are not pushed.

- [ ] **Step 2: Verify remote refs now match**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  git fetch origin main test uat
  "===== $repo ====="
  git rev-parse --short origin/main
  git rev-parse --short origin/test
  git rev-parse --short origin/uat
  git log --pretty=fuller --date=iso-strict -2 origin/main
  Pop-Location
}
```

Expected:
- Each repo prints the same short SHA for `origin/main`, `origin/test`, and `origin/uat`.
- The latest two commits show the May 11-12 dates.

---

## Phase 5: CI Verification

### Task 5: Dispatch Backend Dry-Runs

**Files:**
- No repo file changes.

- [ ] **Step 1: Dispatch dry-run workflows**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  gh workflow run 'BE Pipeline Caller' `
    --repo "ImplementSprint/$repo" `
    --ref test `
    -f pipeline_mode=multi `
    -f enable_security_scan=true `
    -f enable_sonar=true `
    -f enable_k6=true `
    -f k6_script_path=tests/performance `
    -f k6_base_url= `
    -f k6_run_only_on_branch=test,main `
    -f run_deploy=false `
    -f run_promotion=false `
    -f dry_run=true
}
```

Expected:
- Workflows dispatch successfully.
- k6 remains skipped through the service branch rule until real base URLs are configured.

- [ ] **Step 2: Poll workflow results**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
$rows = @()
foreach ($repo in $repos) {
  $latest = gh run list `
    --repo "ImplementSprint/$repo" `
    --workflow 'BE Pipeline Caller' `
    --branch test `
    --event workflow_dispatch `
    --limit 1 `
    --json databaseId |
    ConvertFrom-Json
  $id = $latest[0].databaseId
  $run = gh run view $id --repo "ImplementSprint/$repo" --json status,conclusion,url | ConvertFrom-Json
  $rows += [pscustomobject]@{
    repo = $repo
    id = $id
    status = $run.status
    conclusion = $run.conclusion
    url = $run.url
  }
}
$rows | Sort-Object repo | Format-Table -AutoSize
```

Expected: all included tribe backend dry-runs complete with `conclusion=success`.

---

## Phase 6: Final Local Verification

### Task 6: Confirm Clean Worktrees and Date Shape

**Files:**
- No repo file changes.

- [ ] **Step 1: Check worktree status**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git status -sb
  Pop-Location
}
```

Expected: each repo is clean and points at the rewritten branch head.

- [ ] **Step 2: Confirm final commit dates**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo ====="
  git log --pretty=format:'%h %ad %cd %s' --date=iso-strict -2 origin/main
  Pop-Location
}
```

Expected:

```text
Tribe HEAD   2026-05-12T16:00:00+08:00 fix: harden backend monorepo runtime and CI wiring
Tribe HEAD~1 2026-05-11T10:00:00+08:00 feat: convert backend to NestJS monorepo microservices
Template HEAD   2026-05-10T16:00:00+08:00 fix: harden backend monorepo runtime and CI wiring
Template HEAD~1 2026-05-10T10:00:00+08:00 feat: convert backend to NestJS monorepo microservices
```

The exact commit SHAs will change because the commit metadata changed.

---

## Rollback Plan

Use only if a rewrite is wrong and must be restored.

- [ ] **Step 1: Locate local backup ref**

Run inside the affected repo:

```powershell
git show-ref | Select-String 'refs/backup-authorized-date-rewrite'
```

- [ ] **Step 2: Restore branch from backup**

Example for `main`:

```powershell
git update-ref refs/heads/main refs/backup-authorized-date-rewrite-<timestamp>-main
git push --force-with-lease origin main:main
```

Repeat for `test` and `uat` only if needed.

---

## Self-Review

- Spec coverage: plan covers all tribe backend repos listed in scope plus `template-repo-be-nest`; Trini is restricted to `main`, `test`, and `uat`; tribe target dates are May 11-12, 2026 and template target date is May 10, 2026.
- Placeholder scan: no `TBD` or unresolved implementation placeholders are required for execution.
- Safety: plan uses local backup refs, tree-diff checks, `--force-with-lease`, and excludes Trini's extra branches.

---

## Execution Results

Executed on 2026-05-19 Asia/Manila.

Local backup refs were created with timestamp:

```text
20260519-043418
```

Final remote heads:

| Repo | Final `main/test/uat` head | Conversion commit |
| --- | --- | --- |
| `campus-one-be` | `954100e` | `e53a3f8` |
| `greenovate-be` | `57948b7` | `6a9a12c` |
| `paki-apps-be` | `c5db240` | `b517398` |
| `sho-team-be` | `a016aa0` | `0d5b6ba` |
| `smurf-village-be` | `1c22847` | `1abf0e6` |
| `template-repo-be-nest` | `ce4ab65` | `6fad692` |
| `trini-thrive-be` | `71634eb` | `a93d136` |

Verified remote dates:

```text
Tribe HEAD:       2026-05-12T16:00:00+08:00 fix: harden backend monorepo runtime and CI wiring
Tribe HEAD~1:     2026-05-11T10:00:00+08:00 feat: convert backend to NestJS monorepo microservices
Template HEAD:    2026-05-10T16:00:00+08:00 fix: harden backend monorepo runtime and CI wiring
Template HEAD~1:  2026-05-10T10:00:00+08:00 feat: convert backend to NestJS monorepo microservices
```

Dry-run CI verification passed:

| Repo | Run ID | Result |
| --- | --- | --- |
| `campus-one-be` | `26059023455` | `success` |
| `greenovate-be` | `26059025819` | `success` |
| `paki-apps-be` | `26059028457` | `success` |
| `sho-team-be` | `26059031318` | `success` |
| `smurf-village-be` | `26059033696` | `success` |
| `template-repo-be-nest` | `26059036110` | `success` |
| `trini-thrive-be` | `26059038697` | `success` |
