# Tribe GitHub Packages Onboarding

## Purpose

This checklist helps a tribe install `@implementsprint/sdk` from GitHub Packages in CI without committing tokens or confusing install-time auth with runtime API auth.

## Required Repository Setup

- The tribe repository must have access to the GitHub Package that hosts `@implementsprint/sdk`.
- The workflow must grant `packages: read` for jobs that install private GitHub Packages.
- The npm install step must receive `NODE_AUTH_TOKEN` or `GITHUB_TOKEN`.
- The repository must map the `@implementsprint` scope to GitHub Packages.

## Recommended `.npmrc`

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
always-auth=true
```

## CI Install Requirements

GitHub Actions install jobs should include:

```yaml
permissions:
  contents: read
  packages: read

env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Common Failure

`npm ERR! 401 Unauthorized` from `npm.pkg.github.com` usually means one of these is missing:

- The package is not granted to the consuming repository.
- `packages: read` is missing.
- The token is not available to npm.
- The `@implementsprint` registry mapping is missing.

## Important Boundary

`GITHUB_TOKEN` is install-time package auth. Runtime API Center authentication uses separate runtime environment variables and should not be replaced by npm package auth.
