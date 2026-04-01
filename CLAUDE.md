# CLAUDE.md — central-workflow

## Repository Purpose

Centralized reusable GitHub Actions workflows for the ImplementSprint organization.
All CI/CD pipelines are defined here and consumed by individual repositories via `workflow_call`.

## Pipeline Architecture

### Mobile Pipeline (mobile-workflow.yml + mobile-react-native.yml)

Three-stage dependency graph — each stage requires the previous to pass:

```text
Stage 1 (gates, parallel):
  expo-typescript-standard OR rn-typescript-standard,
  mobile-unit-tests, mobile-lint, mobile-security

Stage 2 (builds, require all Stage 1 to pass):
  android-build, ios-build

Stage 3 (E2E, require respective build to succeed):
  mobile-detox       → requires android-build == success
  mobile-detox-ios   → requires ios-build == success

Separate release-build lanes (master pipeline):
  mobile-expo-release (runs after mobile-expo success/skipped)
    → calls reusable `mobile-release-build.yml`
    → allowed only on test/uat/main
    → builds optional Android release artifacts (.aab/.apk) and iOS release-prep (.xcarchive.zip)

  mobile-react-native-release (runs after mobile-react-native success/skipped)
    → calls reusable `mobile-release-build.yml`
    → allowed only on test/uat/main
    → builds optional Android release artifacts (.aab/.apk) and iOS release-prep (.xcarchive.zip)

Default behavior:
  release artifacts are built in the separate release lane unless explicitly disabled per system
```

Orchestrated by `master-pipeline-mobile.yml` which classifies systems (Expo vs Kotlin vs React Native)
and routes to `mobile-workflow.yml`, `mobile-react-native.yml`, or `mobile-gradle.yml` accordingly.

### Frontend Pipeline (front-end-workflow.yml)

Gates: lint, tests, security scan, frontend standards check.
Build/deploy: Docker build, Vercel deploy, or staging deploy.

### Backend Pipeline (backend-workflow.yml)

Gates: lint, tests, security scan, DB check.
Build/deploy: Docker build, staging deploy, production gate.

## Key Conventions

### Bash Compatibility

- **No `mapfile` or `readarray`** — macOS runners ship Bash 3.2 which lacks these.
- Use `while IFS= read -r -d '' f; do ... done < <(find ... -print0)` instead.
- Use `grep -l` with newline-delimited `while read` for file-path arrays.

### Artifact Formats

- Android: upload `.apk` directly (not tarred)
- iOS: use `ditto -c -k` to create `.app.zip` (not tar.gz)
- Android release (optional): upload direct `.aab`/`.apk` artifacts
- Android release default task runs `assembleRelease bundleRelease` to produce installable APK and AAB
- iOS release-prep (optional): upload `.xcarchive.zip` until signed IPA export is enabled
- Naming: `{system-name}-{type}` (e.g., `MyApp-android-detox-build`)
- Retention: 14 days for build artifacts, 30 days for audit reports

### Concurrency & Deduplication

- Concurrency groups use `github.head_ref || github.ref_name` (not `github.ref`)
  so push and PR events on the same branch share one group.
- `cancel-in-progress: true` cancels the older run when a new one enters the group.
- Promotion-branch PR syncs (head_ref = test/uat/main) are skipped via a condition
  on `systems-config` — the push-triggered run handles CI + promotion, and its
  status checks automatically appear on the PR.
- Feature-branch PRs (head_ref ≠ test/uat/main) still trigger the pipeline normally.

### GitHub Actions Condition Patterns

- Build jobs use `always()` + `!contains(needs.*.result, 'failure')` because
  GitHub Actions skips dependent jobs by default when upstream is skipped.
- Detox E2E jobs require `needs.<build>.result == 'success'` (strict — no skipped fallback).
- The `always()` is still needed on Detox jobs because upstream build jobs use `always()`.
- Release build lanes are branch-gated to test/uat/main and run after Expo/RN CI lane success/skipped.
- For nested reusable workflows, caller jobs must explicitly grant any permissions
  requested by nested jobs (for example `packages: write` and `security-events: write`
  for docker build + SARIF upload paths), or GitHub will reject the workflow at parse time.

### Security Scanning (security-scan.yml)

- `fail-on-high` is relaxed on the `test` branch; enforced on `uat` and `main`.
- License allowlist covers: MIT, ISC, BSD-2/3-Clause, Apache-2.0, CC-BY-3.0/4.0,
  MPL-2.0, BlueOak-1.0.0, LGPL-3.0-or-later, and common SPDX compound expressions.
- `--excludePrivatePackages` is used to skip the repo's own UNLICENSED package.

## Branch Flow

```text
test → uat → main
```

Linear promotion with automated PR creation via `promotion.yml`.

## Reusable Workflows

| Workflow | Purpose |
| ---------- | --------- |
| `mobile-workflow.yml` | Expo mobile CI/CD orchestrator |
| `mobile-react-native.yml` | React Native mobile CI/CD orchestrator |
| `mobile-release-build.yml` | Expo release artifact builder (reusable) |
| `mobile-detox.yml` | Android Detox E2E (reusable) |
| `mobile-detox-ios.yml` | iOS Detox E2E (reusable) |
| `mobile-gradle.yml` | Android Gradle build (reusable) |
| `mobile-ios-build.yml` | iOS xcodebuild (reusable) |
| `mobile-rn-ios-build.yml` | React Native iOS xcodebuild (reusable) |
| `security-scan.yml` | Dependency audit + license check |
| `front-end-workflow.yml` | Frontend CI/CD orchestrator |
| `backend-workflow.yml` | Backend CI/CD orchestrator |
| `master-pipeline-mobile.yml` | Top-level mobile router |
| `master-pipeline-fe.yml` | Top-level frontend router |
| `master-pipeline-be.yml` | Top-level backend router |

## How to Modify Workflows

1. Edit `.github/workflows/<name>.yml` on a feature branch.
2. Use `workflow_call` trigger for reusable workflows.
3. Follow existing input/output naming conventions.
4. Test with a consuming repo (e.g., `template_repo_mobile_single`) before merging.
5. Never use `mapfile` — use `while read` loops for macOS compatibility.
