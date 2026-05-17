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

Use `docs/v1-release-checklist.md` as the required release checklist.

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
