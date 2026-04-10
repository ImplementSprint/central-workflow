# Template Setup: Mobile Multi (Remote-Sourced)

Remote source:
- `ImplementSprint/template-repo-mobile-multi` (default branch)

Verification date:
- 2026-04-10

Current caller workflow ref (documented exactly from remote default branch):
- `ImplementSprint/central-workflow/.github/workflows/master-pipeline-mobile.yml@maestro`

## Required Branches

Create:
- `test`
- `uat`
- `main`

## Local Development Setup

This template combines two systems:
- Expo/TypeScript root app (`.`)
- Kotlin Android app (`kotlin/`)

Root commands:
```bash
npm install
npm run start
npm run android
npm run ios
npm run test
npm run lint
npm run verify
```

Kotlin commands:
```bash
npm run kotlin:assembleDebug
npm run kotlin:assembleRelease
npm run kotlin:test
npm run kotlin:lint
```

## Local Environment Variables

Expo root app expects:
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_API_BASE_URL`

## GitHub Repository Variables (Canonical)

Required:
- `MOBILE_MULTI_SYSTEMS_JSON`

Recommended value:
```json
[
  {
    "name": "mobile-expo",
    "dir": ".",
    "mobile_stack": "expo",
    "enable_android_build": true,
    "enable_ios_build": true,
    "version_stream": "mobile-expo"
  },
  {
    "name": "mobile-kotlin",
    "dir": "kotlin",
    "mobile_stack": "kotlin",
    "gradle_task": "assembleRelease bundleRelease",
    "enable_android_build": true,
    "enable_ios_build": false,
    "version_stream": "mobile-kotlin"
  }
]
```

How to fill each field:
- `name`: stable system label per mobile app lane.
- `dir`: repository-relative path (`.` for Expo root, `kotlin` for Kotlin module).
- `mobile_stack`: stack selector (`expo` or `kotlin`).
- `gradle_task`: Kotlin release task(s) to run.
- `enable_android_build` and `enable_ios_build`: platform lane switches.
- `version_stream`: release/version channel label per system.

## GitHub Repository Secrets

Required with typical default mobile caller behavior:
- `SONAR_TOKEN`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

Optional:
- `K6_CLOUD_TOKEN`
- `K6_CLOUD_PROJECT_ID`

Recommended:
- `GH_PR_TOKEN`

Where to get values:
- SonarCloud settings/token page
- Grafana Cloud k6 project settings
- GitHub PAT settings

## First Run Checklist

1. Configure both local systems (Expo root and Kotlin subfolder).
2. Add `MOBILE_MULTI_SYSTEMS_JSON`.
3. Add Sonar secrets.
4. Push to `test` and confirm both systems are discovered.
5. Validate Android/iOS behavior per each system definition.

## Common Failure Modes

- Wrong `dir` paths in multi-systems JSON.
- Missing Kotlin system override causing wrong lane behavior.
- Sonar enabled without secrets.

For release credential setup, see:
- [mobile-release-signing-advanced.md](mobile-release-signing-advanced.md)
