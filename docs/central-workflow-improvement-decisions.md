# Central Workflow Improvement Decisions

## Purpose

This document records improvement options for `central-workflow` after reviewing the workflow, template, and documentation surfaces. The goal is to make the repository easier to operate and safer for consuming tribes without changing behavior accidentally.

This is a planning and decision document only. No workflow behavior should change because this file exists.

## Reviewed Scope

- Reusable GitHub Actions workflows under `.github/workflows`.
- Consumer caller templates under `templates`.
- Workflow and platform documentation under `docs`.
- Current validation workflow coverage in `.github/workflows/workflow-validation.yml`.
- Recent CI stability work, especially mobile retry/ADB fixes and GitHub Packages SDK install authentication.
- Current release reference model: consumer templates point to `@main`, and `v1` exists as a pinned tag for consumers that need stability.

## Guiding Decisions

| ID | Decision | Why | Risk if Ignored | Safe Rollout |
| --- | --- | --- | --- | --- |
| D1 | Improve validation before refactoring workflows. | The repo has many reusable workflows and consumer-facing templates. A validation layer catches broken contracts before tribes copy or run them. | A cleanup can silently break one app type, especially FE/BE/mobile callers. | Add read-only checks first, then make them blocking once stable. |
| D2 | Keep `@main` as the default live reference, but document when to use `v1`. | Current templates are intentionally pointed to `main`, while `v1` gives teams a stable option. Both are useful. | Tribes may assume `v1` replaces `main`, or expect `v1` to move automatically. | Document policy: `@main` gets latest fixes; `@v1` is pinned and should only move through an announced release process. |
| D3 | Create a workflow contract registry. | Inputs, secrets, permissions, outputs, and package-manager behavior are spread across many YAML files and docs. | Consumers need to reverse-engineer requirements and may miss secrets or permissions. | Add a doc table first. Later, validate docs against workflow metadata where practical. |
| D4 | Standardize third-party action version policy before upgrading actions. | Action versions are mixed across the repo, and mutable tags can change behavior without a repo commit. | Random upstream changes can break validation or artifact handling. | Inventory first, decide allowed versions, then upgrade one action family at a time. |
| D5 | Pin mutable validation dependencies. | `workflow-validation.yml` uses `docker://rhysd/actionlint:latest`, which can drift. | CI can fail because `latest` changed, not because this repo changed. | Pin to a specific actionlint version or digest in a small isolated PR. |
| D6 | Add fixture-based workflow smoke checks. | Template assertions exist, but they do not fully simulate consumer repos. | A workflow can validate syntactically but still fail when called by a tribe repo. | Add minimal fixture repos or fixture directories and run dry-run/static checks before adding heavier tests. |
| D7 | Do not immediately DRY the npm/GitHub Packages install steps. | SDK install auth is security-sensitive and now intentionally repeated in several install lanes. | A shared abstraction mistake can break every SDK-consuming pipeline at once. | First add validation that each install lane has registry setup and token env. Refactor later only if drift becomes a real problem. |
| D8 | Check docs against templates to prevent drift. | Consumer docs and templates should say the same thing about refs, secrets, and setup. | A tribe may follow stale docs while templates are correct, or vice versa. | Add lightweight text checks for documented refs, package auth, and stale branches. |
| D9 | Normalize encoding artifacts as a separate documentation cleanup. | Several docs and comments contain mojibake characters, which hurt readability but are not behavior bugs. | Mixing encoding cleanup with workflow edits creates noisy diffs and harder reviews. | Do one docs-only cleanup after behavior-sensitive work is stable. |
| D10 | Add a tribe onboarding checklist for GitHub Packages access. | The SDK install failure mode is a 401 that looks like a CI bug but is usually package access or token setup. | Multiple tribes can hit the same 401 during adoption. | Add a checklist covering package access, `GITHUB_TOKEN`, `.npmrc`, and GitHub Packages permissions. |

## Recommended Phases

### Phase 1 - Validation and Documentation Only

Make no behavior changes to reusable workflows.

Recommended work:

- Add a workflow contract registry under `docs`.
- Extend validation to cover all caller templates, including frontend, backend, mobile, and Kotlin.
- Add checks for stale central-workflow refs in active templates and docs.
- Add checks that GitHub Packages SDK install lanes include both registry setup and token environment.
- Add a short `@main` versus `@v1` release-reference policy.

Why this first:

- It reduces future breakage risk before any refactor.
- It gives consuming tribes clearer setup instructions immediately.
- It creates objective checks that protect later cleanup work.

### Phase 2 - Release and Consumer Policy

Clarify how tribes should consume this repo.

Recommended work:

- Document that `@main` is the live default for teams that want the latest central fixes.
- Document that `@v1` is a stable pin and should not move casually.
- Define who can approve moving `v1`.
- Define the minimum announcement content before moving a stable tag.
- Add a consumer migration note for switching from `@main` to `@v1`, or from `@v1` back to `@main`.

Why this second:

- The repo now has both `main` and `v1`.
- Without policy, teams can make different assumptions about stability and update timing.

### Phase 3 - Targeted Hardening

Change one small behavior surface at a time.

Recommended work:

- Pin `actionlint` instead of using `latest`.
- Standardize `actions/upload-artifact` and `actions/download-artifact` versions after checking compatibility.
- Review broad top-level permissions in master pipelines and narrow them only where tests prove it is safe.
- Add fixture-based smoke checks for common consumer setups.

Why this third:

- These changes can affect CI behavior.
- They should land after validation is strong enough to catch regressions.

### Phase 4 - Cleanup and Maintainability

Do cleanup only after the operational contracts are protected.

Recommended work:

- Normalize corrupted documentation characters.
- Consolidate repeated explanatory docs where they drift.
- Consider a shared helper pattern for install setup only if validation proves every current lane is covered.
- Add generated summaries from workflow metadata if manual docs become hard to maintain.

Why this last:

- Cleanup is useful, but it should not obscure behavior-sensitive changes.
- Reviewers can approve mechanical cleanup more safely when it is isolated.

## Decisions Not to Implement Yet

- Do not bulk refactor reusable workflows into composite actions yet.
- Do not bulk bump every GitHub Action version in one change.
- Do not change all consumers from `@main` to `@v1`.
- Do not move the `v1` tag automatically from CI.
- Do not mix encoding cleanup with workflow behavior changes.
- Do not remove duplicated SDK install auth blocks until validation proves the replacement is safer.

## Suggested Acceptance Checks

Use these checks before merging future hardening work:

```powershell
git diff --check
```

```powershell
rg -n "central-workflow/.+@(v[0-9]|fix/e2e-policy|maestro)" .github docs templates
```

Expected result: no active stale caller refs except intentional release-policy documentation.

```powershell
rg -n "docker://.*:latest" .github/workflows
```

Expected result after Phase 3: no mutable Docker action tags in validation-critical workflows.

```powershell
rg -n "actions/upload-artifact@|actions/download-artifact@" .github/workflows
```

Expected result after Phase 3: artifact action versions are documented and intentionally standardized.

```powershell
rg -n "@implementsprint:registry|NODE_AUTH_TOKEN|GITHUB_TOKEN" .github/workflows docs templates
```

Expected result: SDK install workflows and consumer docs consistently show GitHub Packages install auth without committing literal tokens.

## Related Implementation Documents

- `docs/workflow-contract-registry.md`
- `docs/release-reference-policy.md`
- `docs/tribe-github-packages-onboarding.md`
- `docs/superpowers/plans/2026-05-18-central-workflow-safety-improvements.md`

## Recommended Next Step

Start with Phase 1. It gives the repo better guardrails without changing how any tribe pipeline runs today.
