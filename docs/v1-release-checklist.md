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
