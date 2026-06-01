# Render Blueprint Backend Contract

## Purpose

Tribe backend repos use `BACKEND_MULTI_SYSTEMS_JSON` for CI and `render.yaml` for Render infrastructure. The two files must describe the same deployable services.

## Service Inventory

Every deployable service must have:

- One `BACKEND_MULTI_SYSTEMS_JSON` entry.
- One `render.yaml` service entry.
- One Dockerfile at the configured `dockerfile_path`.
- One health endpoint exposed at `/api/v1/health` unless the service explicitly overrides the health path.

Render Blueprint `healthCheckPath` is only valid on public `web` services. Private services (`type: pserv`) may still expose an internal health route for application checks, but their Blueprint service entry must not declare `healthCheckPath`.

School/demo tribe environments that must stay at zero Render cost should set deployable services to `render_service_type: "web"` and `render_plan: "free"` in systems JSON so the generated Blueprint includes `type: web` and `plan: free`. Do not use `plan: free` with `type: pserv`; Render private services require a paid plan.

Shared libraries under `libs/` are not deployable services and must not appear in either service list.

## Environments

Use the existing branch convention:

| Git branch | Render environment | Purpose |
| --- | --- | --- |
| `test` | test | integration testing |
| `uat` | uat | user acceptance |
| `main` | production | production release |

Each tribe should create one Blueprint per environment if the Render workspace needs separate test, uat, and production resources.

## Secret Strategy

Commit non-secret values:

- service names
- Dockerfile paths
- health paths
- branch names
- non-secret URLs
- feature flags that are not credentials

Do not commit secret values:

- `APICENTER_TRIBE_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- database passwords
- OAuth client secrets
- API keys

Use Render environment groups for shared secrets:

- `<tribe>-test`
- `<tribe>-uat`
- `<tribe>-production`

Use `sync: false` only for service-local secrets that Render should ask for during initial Blueprint creation.

## Blueprint Sync Rule

Do not manage the same Render service with more than one Blueprint. A service belongs to one Blueprint only.

## Central Workflow Role

Central workflow validates the repo contract and performs CI gates. Render creates and updates services from `render.yaml`.
