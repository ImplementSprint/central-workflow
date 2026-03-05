# k6 Tribe Template (Grafana Cloud)

Use this template when onboarding a tribe repository to the central workflow Grafana k6 stage.

## 1) Copy the script into the tribe repo

Recommended path in the tribe repo:

- `tests/performance/k6-smoke.ts`

Copy from:

- `templates/k6-smoke-template.ts`

## 2) Configure pipeline input

In the tribe caller workflow (or dispatch input), set:

- `k6_script_path: tests/performance`

For mobile callers, pass through these inputs to `master-pipeline-mobile.yml`:

- `enable_grafana_k6` (default `true`)
- `k6_script_path` (default `tests/performance`)
- `k6_base_url` (default empty; optional override)
- `k6_run_only_on_branch` (default `test,uat,main`)

## 3) Required GitHub secrets

Set in the tribe repository:

- `K6_CLOUD_TOKEN`
- `K6_CLOUD_PROJECT_ID`

## 4) Optional runtime tuning

You can tune without changing script code by passing env vars from workflow steps if needed:

- `BASE_URL` (automatically provided by FE post-deploy orchestration when available)
- `K6_VUS` (default `1`)
- `K6_DURATION` (default `30s`)

## 5) Tribe ownership model

- Platform team owns the workflow contract and baseline thresholds.
- Tribe teams own endpoint coverage, realistic scenarios, and SLA thresholds.
- Keep a smoke test mandatory; add separate load/stress scripts per system maturity.

## 6) Mobile k6 testing checklist

- Run one dry run from a non-protected feature branch with `k6_run_only_on_branch` excluding that branch and confirm k6 resolves to `skipped`.
- Run on `test` (or include your branch in `k6_run_only_on_branch`) and confirm k6 executes and uploads `*-grafana-k6-artifacts`.
- Confirm required secrets exist in the repo: `K6_CLOUD_TOKEN`, `K6_CLOUD_PROJECT_ID`.
- Validate expected fail behavior by forcing a threshold failure in script and confirming pipeline aggregate fails.
- Validate expected pass behavior by restoring baseline script thresholds and confirming pipeline aggregate succeeds.
