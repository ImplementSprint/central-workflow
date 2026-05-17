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
