# Selenium Tribe Template

Use this template when onboarding a tribe repository to the central workflow Selenium stage.

## Where the pipeline expects E2E tests

The central Selenium workflow does **not** hardcode a file path. It runs whatever command is configured in `test-command`.

Current default in the reusable workflow:

- `test-command: npm run test:e2e`

So each tribe repo must define in its own `package.json`:

```json
{
  "scripts": {
    "test:e2e": "tsx tests/e2e/selenium-smoke.ts"
  }
}
```

Recommended test location in tribe repos:

- `tests/e2e/selenium-smoke.ts`

## 1) Copy baseline test

Copy this file into the tribe repo:

- source: `templates/selenium-e2e-template.ts`
- target: `tests/e2e/selenium-smoke.ts`

## 2) Install dependencies in tribe repo

```bash
npm install --save-dev selenium-webdriver
npm install --save-dev tsx typescript @types/node
```

If running local Chrome mode in CI, ensure browser/driver availability is handled by your runner setup (central workflow already logs browser tools).

## 3) Runtime environment variables (provided by central workflow)

- `SELENIUM_BROWSER` (`chrome`, `firefox`, etc.)
- `E2E_BASE_URL` (optional target URL)

Selenium runs in local/direct browser mode only. In CI, set `e2e_base_url` in your pipeline caller to avoid falling back to `http://localhost:3000`.

## 4) Ownership model

- Platform team owns orchestration/gates.
- Tribe teams own user journeys/assertions and keep tests aligned with product behavior.
- Start with smoke checks, then add critical flow tests (auth, primary transaction, error states).
