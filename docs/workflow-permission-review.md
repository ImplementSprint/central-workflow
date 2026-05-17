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

## Current Inventory Summary

| Area | Write Permissions Seen | Current Decision |
| --- | --- | --- |
| Caller templates | `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write` | Keep for now because templates delegate to orchestrators that may publish packages, upload SARIF, create promotion PRs, and write tags or release commits depending on enabled lanes. |
| Docker build | `packages: write`, `security-events: write` | Keep because container publishing and SARIF/security upload lanes need write access. |
| FE master pipeline | `contents: write`, `packages: write`, `pull-requests: write`, `security-events: write` | Keep until job-level permission narrowing is tested against versioning, auto-revert, promotion, Docker, and security lanes. |
| BE master pipeline | `contents: write`, `packages: write`, `pull-requests: write`, `security-events: write` | Keep because deploy/version/promotion/security jobs use write-capable operations. |
| Mobile master pipeline | `contents: write`, `packages: write`, `pull-requests: write`, `security-events: write` | Keep because release, security, promotion, package, and rollback lanes share this contract. |
| Kotlin master pipeline | `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write` | Keep until Kotlin release/promotion/security lanes are tested independently. |
| Mobile child workflows | `packages: write`, `security-events: write` | Keep because Android/container/security jobs use package and SARIF-style write operations. |
| `mobile-release-publish.yml` | `contents: write` | Keep because release publishing requires repository write access. |
| `versioning.yml` | `contents: write` | Keep because version tags and release refs require repository write access. |

## Decision

No permission was narrowed in this pass. Every write permission currently identified is tied to a release, package, SARIF/security, promotion, rollback, or versioning path. Narrowing should happen only after the relevant workflow has a focused fixture or live dry-run that proves the target lane still works.

## Next Safe Candidate

The safest future target is job-level narrowing inside master pipelines, not caller-template narrowing. Start by selecting a single job that already declares its own permissions, then reduce one permission and validate that exact lane in GitHub Actions.
