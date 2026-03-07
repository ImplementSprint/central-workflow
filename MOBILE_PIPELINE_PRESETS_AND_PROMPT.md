# Mobile Pipeline Presets + Folder-Structure Prompt

This file gives you:

- 3 drop-in JSON presets for repository variables
- A reusable prompt to generate folder structure and starter files

---

## 0) Minimal JSON standard (recommended)

The mobile pipeline now supports a minimal per-system JSON contract.

Required per system:

- `name`
- `dir`
- `mobile_stack`

Allowed values for `mobile_stack`:

- `expo`
- `kotlin`

Minimal single-system example:

```json
{
  "name": "mobile-expo",
  "dir": ".",
  "mobile_stack": "expo"
}
```

All other flags are optional overrides. If omitted, workflow defaults are used.

Optional iOS override:

- `enable_ios_build` (defaults to `true` for Expo systems)
- `enable_detox_ios` (defaults to `true` for Expo systems; set to `false` to disable)

Note:

- SonarCloud runs once at the master mobile pipeline level, not inside each `mobile-workflow.yml` execution.
- Detox runs by default for Expo systems and is not meant to be toggled per system.
- Detox Android and Detox iOS run by default for Expo systems. Disable iOS Detox with `enable_detox_ios: false`.
- Expo systems are required to use TypeScript, not JavaScript.
- Builds are local (xcodebuild for iOS / Gradle for Android) — Detox consumes those app binaries for E2E, but is not the underlying builder.
- Detox E2E tests consume build artifacts from the build stage (build → test flow).
- The pipeline produces debug APK and simulator .app artifacts for each system.

---

## 1) JSON presets for mobile pipeline scenarios

Use these values in repository variables:

- `MOBILE_SINGLE_SYSTEMS_JSON` for single mode
- `MOBILE_MULTI_SYSTEMS_JSON` for multi mode

### A. Expo-only single

Variable name: `MOBILE_SINGLE_SYSTEMS_JSON`

```json
{
  "name": "mobile-expo",
  "dir": ".",
  "mobile_stack": "expo",
  "enable_grafana_k6": false,
  "k6_script_path": "tests/performance",
  "k6_base_url": "",
  "k6_run_only_on_branch": "test,uat,main",
  "node_version": 20,
  "java_version": "17",
  "coverage_threshold": 80,
  "enable_lint": true,
  "enable_security_scan": true,
  "enable_governance": true,
  "enable_android_build": true,
  "enable_detox_ios": true,
  "version_stream": "mobile-expo"
}
```

### B. Kotlin-only single

Variable name: `MOBILE_SINGLE_SYSTEMS_JSON`

```json
{
  "name": "mobile-kotlin",
  "dir": ".",
  "mobile_stack": "kotlin",
  "enable_grafana_k6": false,
  "k6_script_path": "tests/performance",
  "k6_base_url": "",
  "k6_run_only_on_branch": "test,uat,main",
  "java_version": "17",
  "enable_governance": true,
  "enable_gradle": true,
  "gradle_task": "assembleDebug",
  "enable_docker_build": false,
  "version_stream": "mobile-kotlin"
}
```

### C. Mixed multi (Expo + Kotlin)

Variable name: `MOBILE_MULTI_SYSTEMS_JSON`

```json
[
  {
    "name": "mobile-expo",
    "dir": "apps/mobile-expo",
    "mobile_stack": "expo",
    "enable_grafana_k6": false,
    "k6_script_path": "tests/performance",
    "k6_base_url": "",
    "k6_run_only_on_branch": "test,uat,main",
    "node_version": 20,
    "java_version": "17",
    "coverage_threshold": 80,
    "enable_lint": true,
    "enable_security_scan": true,
    "enable_governance": true,
    "enable_android_build": true,
    "enable_detox_ios": true,
    "version_stream": "mobile-expo"
  },
  {
    "name": "mobile-kotlin",
    "dir": "apps/mobile-kotlin",
    "mobile_stack": "kotlin",
    "enable_grafana_k6": false,
    "k6_script_path": "tests/performance",
    "k6_base_url": "",
    "k6_run_only_on_branch": "test,uat,main",
    "java_version": "17",
    "enable_governance": true,
    "enable_gradle": true,
    "gradle_task": "assembleDebug",
    "version_stream": "mobile-kotlin"
  }
]
```

---

## 2) Copy/paste prompt for folder structure creation

Use this prompt in Copilot Chat (or another coding assistant) inside your target mobile repo.

> I need you to scaffold mobile project structure for CI/CD.
>
> Inputs:
>
> - Scenario: `<expo-single | kotlin-single | mixed-multi>`
> - Base folder: `<repo-root or subfolder>`
> - Expo app folder (if used): `<path>`
> - Kotlin app folder (if used): `<path>`
>
> Requirements:
>
> 1. Create only the minimum folders/files needed for pipeline compatibility.
> 2. Do not modify unrelated files.
> 3. Keep existing project structure if it already exists.
> 4. Output a tree of created/updated files.
>
> For `expo-single`, ensure:
>
> - `package.json` exists at the Expo app folder
> - `tsconfig.json` exists and strict TypeScript is enabled
> - Detox configuration exists (`.detoxrc.js` or `detox` config in `package.json`) with `android.emu.debug` and `ios.sim.debug` configurations
> - `detox` is installed as a local devDependency and the repo's Jest E2E config is compatible with the installed Detox version, either through a supported Detox runner entrypoint such as `detox/runners/jest/testEnvironment`, `detox/runners/jest`, legacy `detox/runners/jest-circus/...`, or a custom Jest environment file
> - basic test/lint scripts exist in `package.json`
>
> For `kotlin-single`, ensure:
>
> - Gradle wrapper exists (`gradlew` + wrapper files)
> - Android/Kotlin app structure is valid for `assembleDebug`
>
> For `mixed-multi`, ensure both structures exist in separate folders and are independently buildable.
>
> Also create/update `.github/workflows` to include exactly one caller file:
>
> - Copy `templates/mobile-pipeline-caller.yml` as `.github/workflows/master-pipeline-mobile.yml`
> - The `pipeline_mode` input controls single vs multi behaviour (default: `auto`)
>
> Finally, provide the exact repository variable value to set:
>
> - `MOBILE_SINGLE_SYSTEMS_JSON` or `MOBILE_MULTI_SYSTEMS_JSON`
> based on the created folder paths.

---

## 3) Quick decision rule

- If one deployable mobile app: use single mode + one system JSON.
- If two independently deployable apps/targets: use multi mode + array JSON.
- Do not split templates by stack; split by topology (single vs multi).

## 4) k6 quality gate note

- Grafana k6 is opt-in by default. Enable it at caller input level (`enable_grafana_k6: true`) and optionally control per-system with (`enable_grafana_k6: true` / `enable_k6: true`).
- When enabled, k6 acts as a blocking quality gate on allowed branches (`k6_run_only_on_branch`, default: `test,uat,main`).

## 5) Expected branch skips

- On `test`: `Version Tag - TEST` runs; `Version Tag - MAIN Release`, `Publish Mobile Release`, and auto-revert jobs are expected to be skipped.
- On `main`: release/version/publish jobs can run (subject to their `if` conditions and prior job success).
- Seeing those branch-mismatched jobs as `skipped` is normal pipeline behavior, not a failure.

## 6) Pipeline stage architecture

The Expo mobile sub-workflow (`mobile-workflow.yml`) uses a two-stage design:

**Stage 1 — Quality gates (parallel):**

- Jest unit tests (+ coverage threshold check)
- Expo + strict TypeScript standard validation
- Lint check
- Security scan (npm audit + license compliance)

**Stage 2 — Build & advanced checks (parallel, starts after all Stage 1 gates pass):**

- Detox E2E (default for Expo systems)
- Expo Android EAS build (artifact downloaded back to GitHub Actions)
- Expo iOS EAS build (artifact downloaded back to GitHub Actions)

All Stage 2 jobs run in parallel. A failure in any Stage 1 gate blocks Stage 2 entirely.

**Monorepo-level analysis:**

- SonarCloud runs once at the master mobile pipeline level after the Expo and Kotlin lanes complete successfully or are skipped.

## 7) Platform coverage note

- Current CI implementation includes Expo EAS builds for Android and iOS, plus direct Gradle builds for Kotlin Android systems.
- Expo baseline: Jest + strict TypeScript + Detox Android emulator + EAS Android/iOS build artifacts.
- Kotlin baseline: direct Gradle Android build artifacts.
- For Expo systems, the repository must provide `EXPO_TOKEN` and valid EAS credentials/profile configuration.
- Expo project linkage may be stored in repo config or injected from CI using `EXPO_PROJECT_ID` (with optional `EXPO_OWNER`).

## 8) Build with GitHub labels (Expo PRs)

You can trigger targeted Expo EAS builds on pull requests by applying labels:

- `eas-build-android:<profile>`
- `eas-build-ios:<profile>`

Examples:

- `eas-build-android:preview`
- `eas-build-ios:production`

Behavior:

- If at least one valid `eas-build-*` label is present, Expo build targets are overridden for that run.
- Only labeled platforms are built.
- Profile values from labels override per-system `eas_profile_android` / `eas_profile_ios` for that run.
- If no valid label is present, normal per-system JSON defaults are used.

Notes:

- Labels are consumed from pull request events (`opened`, `synchronize`, `reopened`, `labeled`).
- The feature is implemented in `templates/mobile-pipeline-caller.yml` and orchestrated in `.github/workflows/master-pipeline-mobile.yml`.
