# Workflow Contract Registry

## Purpose

This registry documents the public contract of reusable workflows in `central-workflow` so consuming tribes know which caller template, inputs, secrets, permissions, and package setup each workflow expects.

## Contract Rules

- Treat every `workflow_call` input as a public contract.
- Treat required secrets and permissions as consumer setup requirements.
- Keep caller templates and docs aligned with this registry.
- Do not remove or rename an input without a migration note.
- Keep caller templates on `@main` unless a tribe intentionally chooses a pinned release reference.

## Primary Caller Contracts

| Area | Reusable Workflow | Caller Template | Required Inputs | Optional Inputs | Required Secrets | Required Permissions | Package/Auth Notes | Artifacts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Frontend | `.github/workflows/master-pipeline-fe.yml` | `templates/fe-pipeline-caller.yml` | None from the caller template; defaults are provided for dispatch inputs. | `pipeline_mode`, `enable_playwright`, `playwright_browsers`, `e2e_base_url`, `playwright_run_only_on_branch`, `enable_grafana_k6`, `k6_script_path`, `k6_base_url`, `k6_run_only_on_branch`, `run_deploy`, `run_promotion`, `dry_run`. | `GH_PR_TOKEN` is expected for promotion PRs and deploy comments when those lanes are enabled. Other secrets are inherited from the consumer repo. | Caller grants `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write`. | npm install lanes support GitHub Packages SDK auth with `GITHUB_TOKEN` / `NODE_AUTH_TOKEN`; consumer repos should not commit literal tokens. | Playwright, test, security, deployment, and summary artifacts are uploaded by child workflows when enabled. |
| Backend | `.github/workflows/master-pipeline-be.yml` | `templates/be-pipeline-caller.yml` | None from the caller template; `BACKEND_MULTI_SYSTEMS_JSON` is required for NestJS monorepo repos. | `pipeline_mode`, `enable_security_scan`, `enable_sonar`, `enable_k6`, `k6_script_path`, `k6_base_url`, `k6_run_only_on_branch`, `run_deploy`, `run_promotion`, `dry_run`. Backend system objects may set `install_dir`, `project`, `image`, `test_command`, `dockerfile_path`, service-specific `k6_script_path`, `k6_base_url`, `k6_run_only_on_branch`, and `version_stream`. | Secrets are inherited from the consumer repo; deployment, SonarCloud, k6, and promotion lanes use their matching repo secrets when enabled. | Caller grants `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write`. | npm install lanes support GitHub Packages SDK auth with `GITHUB_TOKEN` / `NODE_AUTH_TOKEN`; Docker builds pass `GITHUB_TOKEN` as a BuildKit secret for private package installs; consumer repos should not commit literal tokens. NestJS monorepos install from `install_dir`, test with `test_command`, and build containers with `dockerfile_path`; `image` defaults to the service `name` and is prefixed with `ghcr.io/<org>/` by the Docker workflow. Set repository variable `ENABLE_SONAR_CI=false` only when CI-based Sonar must be skipped, for example while SonarCloud Automatic Analysis remains enabled on that project. Backend k6 service jobs run one at a time to stay within Grafana Cloud low-concurrency projects. | Backend test, security, Docker, deployment, k6, and summary artifacts are uploaded by child workflows when enabled. |
| Mobile | `.github/workflows/master-pipeline-mobile.yml` | `templates/mobile-pipeline-caller.yml` | `MOBILE_SINGLE_SYSTEMS_JSON` or `MOBILE_MULTI_SYSTEMS_JSON` repository variable is required for real consumer runs. | `pipeline_mode`, `stack_filter`, `enable_lint`, `enable_security_scan`, `enable_sonar`, `enable_governance`, `enable_maestro`, `enable_maestro_ios`, `enable_grafana_k6`, `k6_script_path`, `k6_base_url`, `k6_run_only_on_branch`, `run_deploy`, `run_promotion`, `dry_run`. | Secrets are inherited from the consumer repo; signing, deploy, SonarCloud, Maestro, k6, and promotion lanes use their matching repo secrets when enabled. | Caller grants `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write`. | Node-based mobile lanes support GitHub Packages SDK auth where npm packages are installed. Kotlin/Gradle lanes use Gradle setup and mobile signing secrets when release lanes are enabled. | Android, iOS, Maestro, test, security, governance, and summary artifacts are uploaded by child workflows when enabled. |
| Kotlin Mobile | `.github/workflows/master-pipeline-kotlin.yml` | `templates/mobile-kotlin-caller.yml` | `working-directory`, `system-name`, `version-stream`, `java-version`, `governance-task`, `gradle-task`, and `release-gradle-task` are supplied by the caller template. | `pipeline_mode`, `enable_lint`, `enable_security_scan`, `enable_sonar`, `enable_governance`, `enable_instrumented_tests`, `enable_maestro`, `maestro-test-command`, `run_deploy`, `run_promotion`, `dry_run`. | Secrets are inherited from the consumer repo; signing, SonarCloud, release publish, and promotion lanes use their matching repo secrets when enabled. | Caller grants `contents: write`, `pull-requests: write`, `packages: write`, `security-events: write`. | Kotlin lanes use Gradle and Android tooling. Any npm-based helper lane must keep GitHub Packages auth separate from runtime API credentials. | Gradle build, test, instrumented test, Maestro, security, release, and summary artifacts are uploaded when enabled. |

Backend caller boolean defaults are intentionally written so manual `workflow_dispatch` values of `false` stay false. Do not rewrite these controls as `dispatch && value || true`; that pattern turns explicit false values back into true.

## Supporting Reusable Workflows

These workflows are called by the master pipelines or can be used directly by specialized consumers:

- `.github/workflows/backend-db-check.yml`
- `.github/workflows/backend-tests.yml`
- `.github/workflows/backend-workflow.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/docker-build.yml`
- `.github/workflows/front-end-workflow.yml`
- `.github/workflows/frontend-standards-check.yml`
- `.github/workflows/frontend-tests.yml`
- `.github/workflows/governance-check.yml`
- `.github/workflows/grafana-k6.yml`
- `.github/workflows/kotlin-governance-check.yml`
- `.github/workflows/kotlin-gradle.yml`
- `.github/workflows/lint-check.yml`
- `.github/workflows/mobile-gradle.yml`
- `.github/workflows/mobile-ios-build.yml`
- `.github/workflows/mobile-maestro-ios.yml`
- `.github/workflows/mobile-maestro.yml`
- `.github/workflows/mobile-react-native.yml`
- `.github/workflows/mobile-release-build.yml`
- `.github/workflows/mobile-release-publish.yml`
- `.github/workflows/mobile-rn-ios-build.yml`
- `.github/workflows/mobile-tests.yml`
- `.github/workflows/mobile-workflow.yml`
- `.github/workflows/notifications.yml`
- `.github/workflows/pipeline-summary.yml`
- `.github/workflows/playwright-e2e.yml`
- `.github/workflows/production-gate.yml`
- `.github/workflows/promotion.yml`
- `.github/workflows/render-deploy.yml`
- `.github/workflows/security-scan.yml`
- `.github/workflows/selenium-e2e.yml`
- `.github/workflows/sonarcloud-scan.yml`
- `.github/workflows/vercel-deploy.yml`
- `.github/workflows/versioning.yml`
- `.github/workflows/workflow-validation.yml`

## Maintenance Checklist

- Update this file when adding, renaming, or removing workflow inputs.
- Update this file when changing required secrets or permissions.
- Update the matching template in `templates`.
- Run `git diff --check`.
- Run stale-reference and token-safety audits before merging.
- Let `.github/workflows/workflow-validation.yml` run in CI before moving a stable tag.
