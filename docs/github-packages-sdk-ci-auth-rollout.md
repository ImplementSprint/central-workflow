# GitHub Packages SDK CI Auth Rollout

This runbook is for onboarding tribe repositories that install `@implementsprint/sdk` through central CI/CD workflows.

## Who Needs This

Use this for any backend, frontend, or mobile tribe repository that has `@implementsprint/sdk` in `package.json` and runs dependency installation in GitHub Actions.

This does not replace API Center runtime credentials. Package installation uses GitHub Packages auth; runtime API calls still use `APICENTER_URL`, `APICENTER_TRIBE_ID`, `APICENTER_TRIBE_SECRET`, scopes, and `consumes` policy.

## Required Consumer `.npmrc`

Every SDK-consuming tribe repo should commit this repository-root `.npmrc`:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

Do not commit a literal GitHub token. For GitHub Actions, `GITHUB_TOKEN` is provided by the workflow runtime. For local installation, set `GITHUB_TOKEN` in the shell session before running `npm install` or `npm ci`.

## Required GitHub Package Access

Grant the consuming repository access to the SDK package:

1. Open GitHub Packages for `@implementsprint/sdk`.
2. Go to package settings.
3. Open the repository or Actions access section.
4. Add the tribe repository that needs to install the SDK.
5. Re-run CI after access is granted.

If CI still returns `401 Unauthorized`, verify package access before changing SDK code.

## Required Central Workflow Reference

Caller workflows should use `@main` so central workflow fixes are picked up immediately:

```yaml
uses: ImplementSprint/central-workflow/.github/workflows/master-pipeline-be.yml@main
```

Use the equivalent `master-pipeline-fe.yml@main`, `master-pipeline-mobile.yml@main`, or `master-pipeline-kotlin.yml@main` for other stacks.

## CI Auth Contract

Central npm install lanes provide:

```yaml
permissions:
  contents: read
  packages: read
```

or a broader existing package permission when a job also publishes packages.

Install steps provide:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ github.token }}
  GITHUB_TOKEN: ${{ github.token }}
```

`actions/setup-node` npm lanes are configured with:

```yaml
registry-url: "https://npm.pkg.github.com"
scope: "@implementsprint"
always-auth: true
```

## First CI Check

After `.npmrc`, package access, and the `@main` central workflow reference are in place:

1. Push to the tribe repo `test` branch.
2. Open the Actions run.
3. Confirm the first `npm ci` step succeeds.
4. Continue normal pipeline validation.

## Common Failures

### `401 Unauthorized`

Check in this order:

1. The tribe repo has access to `@implementsprint/sdk` in GitHub Packages.
2. The repo-root `.npmrc` uses the `@implementsprint` scope.
3. The `.npmrc` contains `${GITHUB_TOKEN}`, not a literal token or an old npm-token placeholder.
4. The caller workflow uses `central-workflow@main`.
5. The failing install job includes `packages: read` and `NODE_AUTH_TOKEN`.

### `404 Not Found`

Check the package name and scope:

```text
@implementsprint/sdk
```

Also confirm the lockfile is not pointing to the public npm registry for this package.

### npm Uses `registry.npmjs.org`

Check that `.npmrc` exists at the same project root where `npm ci` runs, or at the repository root for the central workflow working directory.

### Runtime API Calls Fail After Install Passes

Package install auth is complete. Move to API Center runtime checks:

```text
APICENTER_URL
APICENTER_TRIBE_ID
APICENTER_TRIBE_SECRET
consumes policy
required scopes
```

## Rollout Tracker

Use this table for tribe onboarding:

| Tribe | Repo | Uses SDK | Workflow Type | Current Ref | Package Access Granted | Updated Ref | CI Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| example | example-api | yes | backend | pending | pending | main | pending |

## Local Diagnostic Commands

For a developer machine with `GITHUB_TOKEN` set:

```bash
npm whoami --registry=https://npm.pkg.github.com
npm view @implementsprint/sdk version --registry=https://npm.pkg.github.com
```

Expected:

```text
The commands authenticate to GitHub Packages and can read the SDK version.
```
