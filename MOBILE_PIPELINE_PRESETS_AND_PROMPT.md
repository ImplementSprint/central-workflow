# Mobile Pipeline Presets + Folder-Structure Prompt

This file gives you:
- 3 drop-in JSON presets for repository variables
- A reusable prompt to generate folder structure and starter files

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
  "enable_grafana_k6": true,
  "k6_script_path": "tests/performance/k6-smoke.js",
  "k6_run_only_on_branch": "test,uat,main",
  "node_version": 20,
  "java_version": "17",
  "coverage_threshold": 80,
  "enable_lint": true,
  "enable_security_scan": true,
  "enable_sonar": true,
  "enable_governance": true,
  "enable_detox": true,
  "enable_gradle": true,
  "build_android": true,
  "build_variant": "assembleRelease",
  "gradle_task": "assembleDebug",
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
  "enable_grafana_k6": true,
  "k6_script_path": "tests/performance/k6-smoke.js",
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
    "enable_grafana_k6": true,
    "k6_script_path": "tests/performance/k6-smoke.js",
    "k6_run_only_on_branch": "test,uat,main",
    "node_version": 20,
    "java_version": "17",
    "coverage_threshold": 80,
    "enable_lint": true,
    "enable_security_scan": true,
    "enable_sonar": true,
    "enable_governance": true,
    "enable_detox": true,
    "enable_gradle": true,
    "build_android": true,
    "build_variant": "assembleRelease",
    "gradle_task": "assembleDebug",
    "version_stream": "mobile-expo"
  },
  {
    "name": "mobile-kotlin",
    "dir": "apps/mobile-kotlin",
    "mobile_stack": "kotlin",
    "enable_grafana_k6": true,
    "k6_script_path": "tests/performance/k6-smoke.js",
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
> - Scenario: `<expo-single | kotlin-single | mixed-multi>`
> - Base folder: `<repo-root or subfolder>`
> - Expo app folder (if used): `<path>`
> - Kotlin app folder (if used): `<path>`
>
> Requirements:
> 1. Create only the minimum folders/files needed for pipeline compatibility.
> 2. Do not modify unrelated files.
> 3. Keep existing project structure if it already exists.
> 4. Output a tree of created/updated files.
>
> For `expo-single`, ensure:
> - `package.json` exists at the Expo app folder
> - Expo app has Android support path (`android/` generated if missing via Expo prebuild compatibility)
> - basic test/lint scripts exist in `package.json`
>
> For `kotlin-single`, ensure:
> - Gradle wrapper exists (`gradlew` + wrapper files)
> - Android/Kotlin app structure is valid for `assembleDebug`
>
> For `mixed-multi`, ensure both structures exist in separate folders and are independently buildable.
>
> Also create/update `.github/workflows` to include exactly one caller file:
> - single mode: `master-pipeline-mobile-single.yml`
> - multi mode: `master-pipeline-mobile-multi.yml`
>
> Finally, provide the exact repository variable value to set:
> - `MOBILE_SINGLE_SYSTEMS_JSON` or `MOBILE_MULTI_SYSTEMS_JSON`
> based on the created folder paths.

---

## 3) Quick decision rule

- If one deployable mobile app: use single mode + one system JSON.
- If two independently deployable apps/targets: use multi mode + array JSON.
- Do not split templates by stack; split by topology (single vs multi).

## 4) k6 quality gate note

- Grafana k6 is a blocking quality gate by default on `test`, `uat`, and `main` unless explicitly disabled at caller input level (`enable_grafana_k6: false`) or per-system level (`enable_grafana_k6: false` / `enable_k6: false`).
