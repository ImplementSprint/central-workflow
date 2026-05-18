# Tribe Backend Extra Branches History Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every non-`main`/`test`/`uat` branch in the tribe backend repositories onto the corrected NestJS monorepo microservices history without losing real branch-specific work.

**Architecture:** Use the already-rewritten `main`/`test`/`uat` backend heads as the canonical base in each repo. Extra branches are inventoried first, classified by whether they contain meaningful unique work, then either pointed at the canonical fixed head or rebuilt by replaying their unique feature commits on top of the fixed history.

**Tech Stack:** Git, GitHub CLI, GitHub Actions, PowerShell, NestJS backend monorepos, central reusable backend workflow.

---

## Scope

Repos in scope:

```text
C:\Codes\secret-ops\campus-one-be
C:\Codes\secret-ops\greenovate-be
C:\Codes\secret-ops\paki-apps-be
C:\Codes\secret-ops\sho-team-be
C:\Codes\secret-ops\smurf-village-be
C:\Codes\secret-ops\trini-thrive-be
```

Branches already completed and not the target of this plan:

```text
main
test
uat
```

Every other remote branch in the six tribe backend repos must be inventoried and classified before any push.

## Branch Rewrite Policy

Use these rules exactly:

- The canonical fixed base keeps the agreed history shape: the NestJS monorepo microservices conversion is the first fixed-base commit, and the fixed-base tip is the final hardening/fixes commit.
- Extra feature branches are rebuilt on top of that fixed base. This means a preserved feature branch may have Hopecard or branch-specific commits after the two fixed-base commits, but it must not reintroduce the old non-monorepo backend structure.
- Preserved branch-specific commits must keep the same timeline and the same commit message as the original branch commits. Replay them oldest-to-newest, preserve author date, preserve committer date, preserve author identity, preserve committer identity, and reuse the original commit message with `git commit -C`.
- Rewritten commit hashes are expected to change because the parent history changes. Commit order, dates, author metadata, committer metadata, and messages are the continuity requirements.
- Branches with no meaningful unique work are force-updated to the repo's current fixed `HEAD`.
- Environment-style branches such as `develop`, `dev`, `staging`, or `qa` are force-updated to the repo's current fixed `HEAD`, unless inventory proves they contain active work that must be preserved.
- Feature branches with meaningful unique work are rebuilt on top of the repo's fixed `HEAD` by cherry-picking or rebasing the branch-specific commits.
- Dead branches are not deleted during this plan. They are recorded for a separate explicit cleanup decision.
- Pushes must use `--force-with-lease`, never plain `--force`.
- Before any rewrite, local backup refs are created under `refs/backup/extra-branch-rewrite/YYYYMMDD-HHMMSS/repo-name/sanitized-branch-ref`.

## Current Remote Snapshot

Snapshot captured from GitHub on 2026-05-19 after the `main`/`test`/`uat` rewrite was completed.

| Repo | Extra Remote Branches |
| --- | --- |
| `campus-one-be` | none |
| `greenovate-be` | none |
| `paki-apps-be` | none |
| `sho-team-be` | none |
| `smurf-village-be` | none |
| `trini-thrive-be` | `Develop`, `feat/hopecard-integration` |

Current extra branch heads:

| Repo | Branch | Remote Commit | Ahead Of Fixed Main | Behind Fixed Main | Initial Classification |
| --- | --- | --- | ---: | ---: | --- |
| `trini-thrive-be` | `Develop` | `c197c7c` | 40 | 2 | `feature-preserve` |
| `trini-thrive-be` | `feat/hopecard-integration` | `b03db99` | 24 | 2 | `feature-preserve` |

Both Trini branches contain Hopecard-related work and must not be blindly pointed to fixed `main`.

## Files

**Create:**
- `C:\Codes\secret-ops\central-workflow\docs\superpowers\plans\2026-05-19-tribe-backend-extra-branches-history-rewrite.md`

**Modify during execution:**
- This plan file: append inventory, classification decisions, backup refs, final branch heads, and CI run links.

**Potentially modify only if feature branches need conflict resolution:**
- Files inside the affected tribe backend repo branch after replaying branch-specific commits.

---

## Phase 1: Remote Branch Inventory

### Task 1: Refresh Remote Refs

**Files:**
- Modify: none
- Evidence: append command output summary to this plan under "Execution Log"

- [ ] **Step 1: Fetch all remote refs for each repo**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  git fetch origin --prune
  if ($LASTEXITCODE -ne 0) { throw "$repo fetch failed" }
  Pop-Location
}
```

Expected:

```text
All six repos fetch successfully.
No local branch is rewritten by this command.
```

- [ ] **Step 2: Record remote branches excluding main/test/uat**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
$rows = @()
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  $branches = git for-each-ref refs/remotes/origin --format='%(refname:short)|%(objectname:short)|%(committerdate:iso8601)|%(subject)'
  foreach ($line in $branches) {
    $parts = $line -split '\|', 4
    $branch = $parts[0] -replace '^origin/', ''
    if ($branch -in @('HEAD','main','test','uat')) { continue }
    $rows += [pscustomobject]@{
      Repo = $repo
      Branch = $branch
      Commit = $parts[1]
      CommitterDate = $parts[2]
      Subject = $parts[3]
    }
  }
  Pop-Location
}
$rows | Sort-Object Repo,Branch | Format-Table -AutoSize
```

Expected:

```text
Every extra remote branch is visible in one table.
If no extra branches exist for a repo, that repo has no rows.
```

### Task 2: Record Unique Commit Counts

**Files:**
- Modify: this plan file

- [ ] **Step 1: Compare each extra branch against fixed `origin/main`**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
$rows = @()
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  $branches = git for-each-ref refs/remotes/origin --format='%(refname:short)'
  foreach ($remoteBranch in $branches) {
    $branch = $remoteBranch -replace '^origin/', ''
    if ($branch -in @('HEAD','main','test','uat')) { continue }
    $ahead = git rev-list --count "origin/main..origin/$branch"
    $behind = git rev-list --count "origin/$branch..origin/main"
    $mergeBase = git merge-base "origin/main" "origin/$branch"
    $rows += [pscustomobject]@{
      Repo = $repo
      Branch = $branch
      AheadOfMain = $ahead
      BehindMain = $behind
      MergeBase = $mergeBase.Substring(0, 7)
    }
  }
  Pop-Location
}
$rows | Sort-Object Repo,Branch | Format-Table -AutoSize
```

Expected:

```text
AheadOfMain=0 means the branch has no unique commits relative to fixed main.
AheadOfMain>0 means the branch needs commit inspection before rewrite.
```

---

## Phase 2: Branch Classification

### Task 3: Inspect Branches With Unique Commits

**Files:**
- Modify: this plan file

- [ ] **Step 1: Print unique commit subjects for branches with `AheadOfMain > 0`**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  $branches = git for-each-ref refs/remotes/origin --format='%(refname:short)'
  foreach ($remoteBranch in $branches) {
    $branch = $remoteBranch -replace '^origin/', ''
    if ($branch -in @('HEAD','main','test','uat')) { continue }
    $ahead = [int](git rev-list --count "origin/main..origin/$branch")
    if ($ahead -eq 0) { continue }
    "===== $repo :: $branch ====="
    git log --oneline --decorate --no-merges "origin/main..origin/$branch"
  }
  Pop-Location
}
```

Expected:

```text
Every branch with unique work shows its unique commit list.
Branches with no unique commits do not print commit lists.
```

- [ ] **Step 2: Classify each extra branch**

Record the current classification in the "Branch Decision Table" section using these rows:

```markdown
| Repo | Branch | Ahead | Classification | Rewrite Method | Reason |
| --- | --- | ---: | --- | --- | --- |
| trini-thrive-be | Develop | 40 | feature-preserve | replay-unique-commits | branch contains Hopecard integration history beyond fixed main |
| trini-thrive-be | feat/hopecard-integration | 24 | feature-preserve | replay-unique-commits | branch contains Hopecard integration history beyond fixed main |
```

Allowed `Classification` values:

```text
environment
no-unique-work
feature-preserve
dead-record-only
```

Allowed `Rewrite Method` values:

```text
point-to-fixed-head
replay-unique-commits
record-only-no-push
```

---

## Phase 3: Safety Backups

### Task 4: Create Local Backup Refs

**Files:**
- Modify: `.git` refs in each tribe backend repo
- Modify: this plan file with backup ref names

- [ ] **Step 1: Create backup refs for every extra remote branch**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  $branches = git for-each-ref refs/remotes/origin --format='%(refname:short)'
  foreach ($remoteBranch in $branches) {
    $branch = $remoteBranch -replace '^origin/', ''
    if ($branch -in @('HEAD','main','test','uat')) { continue }
    $safeBranch = $branch -replace '[^A-Za-z0-9._-]', '_'
    $backupRef = "refs/backup/extra-branch-rewrite/$timestamp/$repo/$safeBranch"
    git update-ref $backupRef "origin/$branch"
    if ($LASTEXITCODE -ne 0) { throw "$repo backup failed for $branch" }
    "$repo $branch backed up at $backupRef"
  }
  Pop-Location
}
```

Expected:

```text
Each extra branch has a local backup ref.
No remote backup refs are pushed.
```

- [ ] **Step 2: Verify backups resolve**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  Push-Location "C:\Codes\secret-ops\$repo"
  "===== $repo backups ====="
  git for-each-ref refs/backup/extra-branch-rewrite --format='%(refname:short) %(objectname:short)'
  Pop-Location
}
```

Expected:

```text
Backup refs print with commit hashes.
```

---

## Phase 4: Confirm No Safe Reset Branches

### Task 5: Verify Current Inventory Has No `point-to-fixed-head` Branches

**Files:**
- Modify: this plan file with execution note

- [ ] **Step 1: Confirm no current extra branch is classified `point-to-fixed-head`**

Run:

```powershell
$decisionRows = @(
  [pscustomobject]@{
    Repo = 'trini-thrive-be'
    Branch = 'Develop'
    Classification = 'feature-preserve'
    RewriteMethod = 'replay-unique-commits'
  },
  [pscustomobject]@{
    Repo = 'trini-thrive-be'
    Branch = 'feat/hopecard-integration'
    Classification = 'feature-preserve'
    RewriteMethod = 'replay-unique-commits'
  }
)
$safeResetRows = $decisionRows | Where-Object { $_.RewriteMethod -eq 'point-to-fixed-head' }
if ($safeResetRows.Count -ne 0) {
  $safeResetRows | Format-Table -AutoSize
  throw 'Current plan unexpectedly contains safe reset branches.'
}
'No current extra branch will be pointed directly to fixed main.'
```

Expected:

```text
No current extra branch will be pointed directly to fixed main.
```

- [ ] **Step 2: Record the Phase 4 skip decision**

Append this note under "Execution Log" after Step 1 succeeds:

```markdown
2026-05-19 Phase 4: skipped safe branch reset. Current inventory has no `point-to-fixed-head` branches; both extra Trini branches are `feature-preserve`.
```

Expected:

```text
The plan shows why no direct force-update to fixed main was performed.
```

---

## Phase 5: Rewrite Feature Branches With Preserved Work

### Task 6: Rebuild Trini Feature Branches On Fixed Base

**Files:**
- Modify: branch-specific files only when cherry-pick conflicts require resolution

- [ ] **Step 1: Create rewrite branches from fixed Trini main**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git fetch origin --prune
git switch --force-create "rewrite/Develop" origin/main
git switch --force-create "rewrite/feat_hopecard-integration" origin/main
Pop-Location
```

Expected:

```text
rewrite/Develop starts at the fixed NestJS monorepo backend head.
rewrite/feat_hopecard-integration starts at the fixed NestJS monorepo backend head.
```

- [ ] **Step 2: Review default preserve and exclude commit lists**

Use this starting decision set for both Trini branches. These commits are Hopecard or backend behavior work that should be replayed unless inspection proves a commit is superseded:

```text
f18ccc7 feat(hopecard): extract and integrate all four persona backends
44b4756 fix(hopecard): cross-check fixes - CM hardcoded ports, Beneficiary fallback, eslint configs
0a6a173 test(hopecard): add unit tests to meet 80% coverage gate across all personas
9ed76c8 chore(hopecard): exclude Admin and Digital Donor from SonarCloud coverage gate
4652a34 fix(hopecard): move persona backends from hopecard/ to src/hopecard/ per CICD requirement
358b234 fix(hopecard): consolidate all persona backends into root NestJS app per CICD requirement
83173ce Update health.service.ts
314feb2 feat(hopecard): add persona and system claims to admin-auth JWT
```

These commits are excluded by default because their subjects indicate local settings, noisy CI retries, scratch files, or old SDK wiring that must not be replayed unless inspection proves they contain required production code:

```text
b03db99 Update settings.local.json
746fa1b test
041808c backend unit test fix
031a9d4 cicd
44fb2bc cleanup
d1040c7 Create test.html
57a81c9 commitment
2831846 cicd
a5e32cc cicd
da4aee8 Update .npmrc
52ee2b6 cicd
c785e58 sdk
1c3a80b check docker cmd
e87bd5b woopsie
27b04b6 CICD
694a41d cicd
```

- [ ] **Step 3: Replay reviewed Hopecard commits onto `rewrite/feat_hopecard-integration` while preserving timeline and messages**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git switch "rewrite/feat_hopecard-integration"
function Invoke-TimelinePreservingReplay {
  param(
    [Parameter(Mandatory = $true)][string]$Commit,
    [Parameter(Mandatory = $true)][string]$BranchName
  )

  $authorDate = git show -s --format=%aI $Commit
  $authorName = git show -s --format=%an $Commit
  $authorEmail = git show -s --format=%ae $Commit
  $committerDate = git show -s --format=%cI $Commit
  $committerName = git show -s --format=%cn $Commit
  $committerEmail = git show -s --format=%ce $Commit

  git cherry-pick --no-commit $Commit
  if ($LASTEXITCODE -ne 0) {
    throw "Cherry-pick stopped at $Commit in $BranchName. Resolve conflicts into the NestJS monorepo layout, stage the resolved files, then set GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL, GIT_AUTHOR_DATE, GIT_COMMITTER_NAME, GIT_COMMITTER_EMAIL, and GIT_COMMITTER_DATE to the original values before running git commit -C $Commit."
  }

  $env:GIT_AUTHOR_NAME = $authorName
  $env:GIT_AUTHOR_EMAIL = $authorEmail
  $env:GIT_AUTHOR_DATE = $authorDate
  $env:GIT_COMMITTER_NAME = $committerName
  $env:GIT_COMMITTER_EMAIL = $committerEmail
  $env:GIT_COMMITTER_DATE = $committerDate
  git commit -C $Commit
  Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
  if ($LASTEXITCODE -ne 0) {
    throw "Timeline-preserving commit failed for $Commit in $BranchName."
  }
}

$hopecardCommits = @(
  'f18ccc7',
  '44b4756',
  '0a6a173',
  '9ed76c8',
  '4652a34',
  '358b234',
  '83173ce',
  '314feb2'
)
foreach ($commit in $hopecardCommits) {
  Invoke-TimelinePreservingReplay -Commit $commit -BranchName 'trini-thrive-be/feat/hopecard-integration'
}
Pop-Location
```

Expected:

```text
The Hopecard branch contains fixed NestJS monorepo history plus reviewed Hopecard commits.
Each replayed commit keeps the original author date, committer date, author identity, committer identity, and commit message.
Cherry-pick conflicts, if any, are explicit and resolved inside the monorepo structure before the timeline-preserving commit is created.
```

- [ ] **Step 4: Replay reviewed Hopecard commits onto `rewrite/Develop` while preserving timeline and messages**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git switch "rewrite/Develop"
function Invoke-TimelinePreservingReplay {
  param(
    [Parameter(Mandatory = $true)][string]$Commit,
    [Parameter(Mandatory = $true)][string]$BranchName
  )

  $authorDate = git show -s --format=%aI $Commit
  $authorName = git show -s --format=%an $Commit
  $authorEmail = git show -s --format=%ae $Commit
  $committerDate = git show -s --format=%cI $Commit
  $committerName = git show -s --format=%cn $Commit
  $committerEmail = git show -s --format=%ce $Commit

  git cherry-pick --no-commit $Commit
  if ($LASTEXITCODE -ne 0) {
    throw "Cherry-pick stopped at $Commit in $BranchName. Resolve conflicts into the NestJS monorepo layout, stage the resolved files, then set GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL, GIT_AUTHOR_DATE, GIT_COMMITTER_NAME, GIT_COMMITTER_EMAIL, and GIT_COMMITTER_DATE to the original values before running git commit -C $Commit."
  }

  $env:GIT_AUTHOR_NAME = $authorName
  $env:GIT_AUTHOR_EMAIL = $authorEmail
  $env:GIT_AUTHOR_DATE = $authorDate
  $env:GIT_COMMITTER_NAME = $committerName
  $env:GIT_COMMITTER_EMAIL = $committerEmail
  $env:GIT_COMMITTER_DATE = $committerDate
  git commit -C $Commit
  Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
  if ($LASTEXITCODE -ne 0) {
    throw "Timeline-preserving commit failed for $Commit in $BranchName."
  }
}

$developCommits = @(
  'f18ccc7',
  '44b4756',
  '0a6a173',
  '9ed76c8',
  '4652a34',
  '358b234',
  '83173ce',
  '314feb2'
)
foreach ($commit in $developCommits) {
  Invoke-TimelinePreservingReplay -Commit $commit -BranchName 'trini-thrive-be/Develop'
}
Pop-Location
```

Expected:

```text
The Develop branch contains fixed NestJS monorepo history plus reviewed Hopecard commits.
Each replayed commit keeps the original author date, committer date, author identity, committer identity, and commit message.
Commits unique to Develop beyond the Hopecard branch are reviewed separately before replay.
```

- [ ] **Step 5: Verify replayed commit metadata before inspecting additional `Develop` history**

Run this for each rewrite branch after replay:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"

$branchesToVerify = @(
  @{
    Name = 'rewrite/feat_hopecard-integration'
    OriginalCommits = @('f18ccc7','44b4756','0a6a173','9ed76c8','4652a34','358b234','83173ce','314feb2')
  },
  @{
    Name = 'rewrite/Develop'
    OriginalCommits = @('f18ccc7','44b4756','0a6a173','9ed76c8','4652a34','358b234','83173ce','314feb2')
  }
)

foreach ($branch in $branchesToVerify) {
  git switch $branch.Name
  $rewrittenCommits = git rev-list --reverse "origin/main..HEAD"
  if ($rewrittenCommits.Count -ne $branch.OriginalCommits.Count) {
    throw "$($branch.Name) replay count mismatch. Expected $($branch.OriginalCommits.Count), got $($rewrittenCommits.Count)."
  }

  for ($index = 0; $index -lt $branch.OriginalCommits.Count; $index++) {
    $original = $branch.OriginalCommits[$index]
    $rewritten = $rewrittenCommits[$index]
    $originalMeta = [string]::Join("`n", (git show -s --format='%aI|%cI|%an|%ae|%cn|%ce|%B' $original))
    $rewrittenMeta = [string]::Join("`n", (git show -s --format='%aI|%cI|%an|%ae|%cn|%ce|%B' $rewritten))
    if ($originalMeta -ne $rewrittenMeta) {
      throw "$($branch.Name) metadata mismatch for original $original and rewritten $rewritten."
    }
  }
}

Pop-Location
```

Expected:

```text
Each rewritten commit matches the original commit's author date, committer date, author name, author email, committer name, committer email, and full commit message.
Commit hashes differ because the commits now sit on the fixed NestJS monorepo base.
```

- [ ] **Step 6: Inspect additional `Develop` merge-only history before push**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git log --oneline --merges "origin/main..origin/Develop"
git diff --name-status "rewrite/feat_hopecard-integration..origin/Develop"
Pop-Location
```

Expected:

```text
Merge commits are inspected for effective file changes.
If the diff is empty or only duplicates replayed Hopecard work, no additional Develop commit is replayed.
If the diff contains production work, add the exact commit hashes to the Execution Log before replaying them.
```

- [ ] **Step 7: Resolve conflicts using NestJS monorepo paths**

If conflicts occur, preserve the NestJS monorepo layout:

```text
apps/api
apps/location-service
libs/api-center
libs/common
libs/contracts
libs/supabase
```

Do not restore the old non-monorepo layout.

- [ ] **Step 8: Run repo verification on `rewrite/feat_hopecard-integration`**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git switch "rewrite/feat_hopecard-integration"
npm run lint -- --quiet
npm run typecheck
npm run build
npm run test:cov -- --runInBand --silent
npm run test:e2e -- --runInBand --silent
git diff --check HEAD
Pop-Location
```

Expected:

```text
All commands exit 0.
If a feature branch intentionally lacks e2e compatibility, record the failing command and root cause before pushing.
```

- [ ] **Step 9: Run repo verification on `rewrite/Develop`**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git switch "rewrite/Develop"
npm run lint -- --quiet
npm run typecheck
npm run build
npm run test:cov -- --runInBand --silent
npm run test:e2e -- --runInBand --silent
git diff --check HEAD
Pop-Location
```

Expected:

```text
All commands exit 0.
If a feature branch intentionally lacks e2e compatibility, record the failing command and root cause before pushing.
```

- [ ] **Step 10: Replace original remote feature branches with lease protection**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git push --force-with-lease origin "rewrite/feat_hopecard-integration:feat/hopecard-integration"
git push --force-with-lease origin "rewrite/Develop:Develop"
Pop-Location
```

Expected:

```text
Both remote feature branches now have fixed NestJS monorepo history plus preserved Hopecard work.
If --force-with-lease rejects, stop, fetch, inspect the new remote commit, and update the plan before retrying.
```

---

## Phase 6: CI Verification

### Task 7: Dispatch Dry-Runs On Rewritten Branches

**Files:**
- Modify: this plan file with run URLs and results

- [ ] **Step 1: Run dry-run workflow for Trini `feat/hopecard-integration`**

Run:

```powershell
gh workflow run "BE Pipeline Caller" `
  --repo "ImplementSprint/trini-thrive-be" `
  --ref "feat/hopecard-integration" `
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
```

Expected:

```text
Workflow dispatch succeeds and returns a GitHub Actions run.
k6 remains skipped until service-level real base URLs are configured.
```

- [ ] **Step 2: Run dry-run workflow for Trini `Develop`**

Run:

```powershell
gh workflow run "BE Pipeline Caller" `
  --repo "ImplementSprint/trini-thrive-be" `
  --ref "Develop" `
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
```

Expected:

```text
Workflow dispatch succeeds and returns a GitHub Actions run.
k6 remains skipped until service-level real base URLs are configured.
```

- [ ] **Step 3: Poll the two newest dry-runs to completion**

Run:

```powershell
$runs = gh run list `
  --repo "ImplementSprint/trini-thrive-be" `
  --workflow "BE Pipeline Caller" `
  --limit 10 `
  --json databaseId,headBranch,status,conclusion,url |
  ConvertFrom-Json |
  Where-Object { $_.headBranch -in @('Develop','feat/hopecard-integration') } |
  Select-Object -First 2

foreach ($run in $runs) {
  gh run watch $run.databaseId --repo "ImplementSprint/trini-thrive-be" --exit-status
  gh run view $run.databaseId --repo "ImplementSprint/trini-thrive-be" --json status,conclusion,url,jobs
}
```

Expected:

```text
Both selected runs complete with conclusion=success.
If a run fails, record the failing job, log URL, and root cause in this plan before applying a fix.
```

---

## Phase 7: Documentation Closure

### Task 8: Update This Plan With Results

**Files:**
- Modify: this plan file

- [ ] **Step 1: Fill the Branch Decision Table**

Record every extra branch with the current known values:

```markdown
| Repo | Branch | Original Commit | Final Commit | Classification | Rewrite Method | CI Run |
| --- | --- | --- | --- | --- | --- | --- |
| trini-thrive-be | Develop | c197c7c | b27635b | feature-preserve | replay-unique-commits | 26060644800 success |
| trini-thrive-be | feat/hopecard-integration | b03db99 | b27635b | feature-preserve | replay-unique-commits | 26060642336 success |
```

- [ ] **Step 2: Record backup refs**

Record backup refs in this format after Phase 3 creates them:

```markdown
| Repo | Branch | Backup Ref | Backup Commit |
| --- | --- | --- | --- |
| trini-thrive-be | Develop | refs/backup/extra-branch-rewrite/20260519-044740/trini-thrive-be/Develop | c197c7c |
| trini-thrive-be | feat/hopecard-integration | refs/backup/extra-branch-rewrite/20260519-044740/trini-thrive-be/feat_hopecard-integration | b03db99 |
```

- [ ] **Step 3: Record final verification summary**

Use this format after Phase 6 dispatches the runs:

```markdown
| Repo | Branch | Workflow Run | Result |
| --- | --- | --- | --- |
| trini-thrive-be | Develop | 26060644800 | success |
| trini-thrive-be | feat/hopecard-integration | 26060642336 | success |
```

- [ ] **Step 4: Commit central documentation**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\central-workflow"
git add docs/superpowers/plans/2026-05-19-tribe-backend-extra-branches-history-rewrite.md
git commit --no-gpg-sign -m "docs: plan tribe backend extra branch rewrites"
git push origin main
Pop-Location
```

Expected:

```text
The plan and execution record are pushed to central-workflow.
```

---

## Branch Decision Table

| Repo | Branch | Original Commit | Final Commit | Classification | Rewrite Method | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `trini-thrive-be` | `Develop` | `c197c7c` | `b27635b` | `feature-preserve` | `replay-unique-commits` | branch was 40 commits ahead of fixed main; effective content matched `feat/hopecard-integration` except merge commits, so final rewritten head matches the feature branch |
| `trini-thrive-be` | `feat/hopecard-integration` | `b03db99` | `b27635b` | `feature-preserve` | `replay-unique-commits` | branch was 24 commits ahead of fixed main and its reviewed Hopecard commits were replayed onto the fixed NestJS monorepo base |

## Backup Refs

| Repo | Branch | Backup Ref | Backup Commit |
| --- | --- | --- | --- |
| `trini-thrive-be` | `Develop` | `refs/backup/extra-branch-rewrite/20260519-044740/trini-thrive-be/Develop` | `c197c7c` |
| `trini-thrive-be` | `feat/hopecard-integration` | `refs/backup/extra-branch-rewrite/20260519-044740/trini-thrive-be/feat_hopecard-integration` | `b03db99` |

## CI Runs

| Repo | Branch | Workflow Run | Result |
| --- | --- | --- | --- |
| `trini-thrive-be` | `Develop` | [26060644800](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26060644800) | `success`, head `b27635bd976e6817594ee6adf04af7c4037a2fe1` |
| `trini-thrive-be` | `feat/hopecard-integration` | [26060642336](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26060642336) | `success`, head `b27635bd976e6817594ee6adf04af7c4037a2fe1` |

## Execution Log

2026-05-19 Plan formation: GitHub branch inventory found no extra branches in `campus-one-be`, `greenovate-be`, `paki-apps-be`, `sho-team-be`, or `smurf-village-be`. Only `trini-thrive-be` has extra branches: `Develop` at `c197c7c` and `feat/hopecard-integration` at `b03db99`.

2026-05-19 Execution: refreshed all six tribe backend remotes. Corrected the inventory script behavior by excluding the remote `origin/HEAD` short-name row that appears as `origin`.

2026-05-19 Execution: created local backup refs for the two Trini extra branches under `refs/backup/extra-branch-rewrite/20260519-044740/trini-thrive-be/`.

2026-05-19 Execution: rebuilt `rewrite/feat_hopecard-integration` from fixed Trini `origin/main` (`71634eb`). Replayed the reviewed Hopecard commits oldest-to-newest while preserving author date, committer date, author identity, committer identity, and commit message. Conflict resolution kept the NestJS monorepo layout by moving Hopecard API modules under `apps/api/src/*`, shared helpers under `libs/common/src/*`, and keeping the fixed monorepo `package.json`, `tsconfig.json`, and workspace structure.

2026-05-19 Execution: original `Develop` had no effective file diff beyond `origin/feat/hopecard-integration`; it only carried merge commits. `rewrite/Develop` was pointed to the same rewritten head as `rewrite/feat_hopecard-integration`.

2026-05-19 Verification: replay metadata verification passed for both rewrite branches. Local `npm run lint -- --quiet` passed. `git diff --check HEAD` passed. Local `npm run typecheck` could not complete because local `npm install` cannot authenticate to GitHub Packages for `@implementsprint/sdk`; the GitHub Actions runs have the required token and completed successfully.

2026-05-19 Push: force-with-lease updated `feat/hopecard-integration` from `b03db99` to `b27635b`, and `Develop` from `c197c7c` to `b27635b`.

2026-05-19 CI: dispatched `BE Pipeline Caller` dry-runs with `dry_run=true`, `run_deploy=false`, `run_promotion=false`, security/Sonar enabled, and k6 enabled but branch-gated. Runs [26060642336](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26060642336) and [26060644800](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26060644800) both completed with `success`.

2026-05-19 correction: the first replay made Hopecard domains modules inside `apps/api`, which was CI-valid but not true app-per-service microservice architecture. Follow-up plan `2026-05-19-trini-hopecard-microservice-split-correction.md` corrected this by moving Hopecard domains into five deployable Nest apps, updating `BACKEND_MULTI_SYSTEMS_JSON`, and force-with-lease updating both `feat/hopecard-integration` and `Develop` from `b27635b` to `cc107fa`. Corrected dry-runs [26061974613](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26061974613) and [26061976547](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26061976547) completed with `success`.
