# Backend Multi Systems JSON for App-Per-Service Repos

Use this as the value of the consumer repository variable `BACKEND_MULTI_SYSTEMS_JSON` when the backend is a NestJS monorepo with one deployable app per folder under `apps/`.

```json
[
  {
    "name": "api",
    "dir": ".",
    "install_dir": ".",
    "project": "api",
    "image": "api",
    "backend_stack": "nestjs",
    "version_stream": "api",
    "test_command": "npm run test:cov -- --selectProjects api",
    "dockerfile_path": "apps/api/Dockerfile",
    "k6_script_path": "tests/performance/api-smoke.js"
  },
  {
    "name": "bayanihub-admin-service",
    "dir": ".",
    "install_dir": ".",
    "project": "bayanihub-admin-service",
    "image": "bayanihub-admin-service",
    "backend_stack": "nestjs",
    "version_stream": "bayanihub-admin-service",
    "test_command": "npm run test:cov -- --selectProjects bayanihub-admin-service",
    "dockerfile_path": "apps/bayanihub-admin-service/Dockerfile",
    "k6_script_path": "tests/performance/bayanihub-admin-service-smoke.js"
  },
  {
    "name": "bayanihub-enduser-service",
    "dir": ".",
    "install_dir": ".",
    "project": "bayanihub-enduser-service",
    "image": "bayanihub-enduser-service",
    "backend_stack": "nestjs",
    "version_stream": "bayanihub-enduser-service",
    "test_command": "npm run test:cov -- --selectProjects bayanihub-enduser-service",
    "dockerfile_path": "apps/bayanihub-enduser-service/Dockerfile",
    "k6_script_path": "tests/performance/bayanihub-enduser-service-smoke.js"
  },
  {
    "name": "bayanihub-sitemanager-service",
    "dir": ".",
    "install_dir": ".",
    "project": "bayanihub-sitemanager-service",
    "image": "bayanihub-sitemanager-service",
    "backend_stack": "nestjs",
    "version_stream": "bayanihub-sitemanager-service",
    "test_command": "npm run test:cov -- --selectProjects bayanihub-sitemanager-service",
    "dockerfile_path": "apps/bayanihub-sitemanager-service/Dockerfile",
    "k6_script_path": "tests/performance/bayanihub-sitemanager-service-smoke.js"
  },
  {
    "name": "damayan-admin-service",
    "dir": ".",
    "install_dir": ".",
    "project": "damayan-admin-service",
    "image": "damayan-admin-service",
    "backend_stack": "nestjs",
    "version_stream": "damayan-admin-service",
    "test_command": "npm run test:cov -- --selectProjects damayan-admin-service",
    "dockerfile_path": "apps/damayan-admin-service/Dockerfile",
    "k6_script_path": "tests/performance/damayan-admin-service-smoke.js"
  },
  {
    "name": "damayan-citizen-service",
    "dir": ".",
    "install_dir": ".",
    "project": "damayan-citizen-service",
    "image": "damayan-citizen-service",
    "backend_stack": "nestjs",
    "version_stream": "damayan-citizen-service",
    "test_command": "npm run test:cov -- --selectProjects damayan-citizen-service",
    "dockerfile_path": "apps/damayan-citizen-service/Dockerfile",
    "k6_script_path": "tests/performance/damayan-citizen-service-smoke.js"
  },
  {
    "name": "damayan-dispatcher-service",
    "dir": ".",
    "install_dir": ".",
    "project": "damayan-dispatcher-service",
    "image": "damayan-dispatcher-service",
    "backend_stack": "nestjs",
    "version_stream": "damayan-dispatcher-service",
    "test_command": "npm run test:cov -- --selectProjects damayan-dispatcher-service",
    "dockerfile_path": "apps/damayan-dispatcher-service/Dockerfile",
    "k6_script_path": "tests/performance/damayan-dispatcher-service-smoke.js"
  },
  {
    "name": "damayan-site-manager-service",
    "dir": ".",
    "install_dir": ".",
    "project": "damayan-site-manager-service",
    "image": "damayan-site-manager-service",
    "backend_stack": "nestjs",
    "version_stream": "damayan-site-manager-service",
    "test_command": "npm run test:cov -- --selectProjects damayan-site-manager-service",
    "dockerfile_path": "apps/damayan-site-manager-service/Dockerfile",
    "k6_script_path": "tests/performance/damayan-site-manager-service-smoke.js"
  },
  {
    "name": "hopecard-admin-service",
    "dir": ".",
    "install_dir": ".",
    "project": "hopecard-admin-service",
    "image": "hopecard-admin-service",
    "backend_stack": "nestjs",
    "version_stream": "hopecard-admin-service",
    "test_command": "npm run test:cov -- --selectProjects hopecard-admin-service",
    "dockerfile_path": "apps/hopecard-admin-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-admin-service-smoke.js"
  },
  {
    "name": "hopecard-beneficiary-service",
    "dir": ".",
    "install_dir": ".",
    "project": "hopecard-beneficiary-service",
    "image": "hopecard-beneficiary-service",
    "backend_stack": "nestjs",
    "version_stream": "hopecard-beneficiary-service",
    "test_command": "npm run test:cov -- --selectProjects hopecard-beneficiary-service",
    "dockerfile_path": "apps/hopecard-beneficiary-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-beneficiary-service-smoke.js"
  },
  {
    "name": "hopecard-campaign-manager-service",
    "dir": ".",
    "install_dir": ".",
    "project": "hopecard-campaign-manager-service",
    "image": "hopecard-campaign-manager-service",
    "backend_stack": "nestjs",
    "version_stream": "hopecard-campaign-manager-service",
    "test_command": "npm run test:cov -- --selectProjects hopecard-campaign-manager-service",
    "dockerfile_path": "apps/hopecard-campaign-manager-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-campaign-manager-service-smoke.js"
  },
  {
    "name": "hopecard-donor-service",
    "dir": ".",
    "install_dir": ".",
    "project": "hopecard-donor-service",
    "image": "hopecard-donor-service",
    "backend_stack": "nestjs",
    "version_stream": "hopecard-donor-service",
    "test_command": "npm run test:cov -- --selectProjects hopecard-donor-service",
    "dockerfile_path": "apps/hopecard-donor-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-donor-service-smoke.js"
  },
  {
    "name": "hopecard-notification-service",
    "dir": ".",
    "install_dir": ".",
    "project": "hopecard-notification-service",
    "image": "hopecard-notification-service",
    "backend_stack": "nestjs",
    "version_stream": "hopecard-notification-service",
    "test_command": "npm run test:cov -- --selectProjects hopecard-notification-service",
    "dockerfile_path": "apps/hopecard-notification-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-notification-service-smoke.js"
  },
  {
    "name": "location-service",
    "dir": ".",
    "install_dir": ".",
    "project": "location-service",
    "image": "location-service",
    "backend_stack": "nestjs",
    "version_stream": "location-service",
    "test_command": "npm run test:cov -- --selectProjects location-service",
    "dockerfile_path": "apps/location-service/Dockerfile",
    "k6_script_path": "tests/performance/location-service-smoke.js"
  }
]
```

Verify the exact folder names for the screenshot-truncated entries before setting the variable:

- `bayanihub-enduser-service`
- `bayanihub-sitemanager-service`
- `damayan-dispatcher-service`
- `damayan-site-manager-service`

## Docker Requirement

For the current central backend workflow, every deployable service in `BACKEND_MULTI_SYSTEMS_JSON` should have a Dockerfile at the configured `dockerfile_path`.

That is because the backend pipeline has a Docker build lane per active service, and the central workflow uses the service object's `dir`, `image`, and `dockerfile_path` to build that service container. If a service is not independently deployable, do not include it in `BACKEND_MULTI_SYSTEMS_JSON`; keep it as a library/module under `libs/` or inside another app.

In a NestJS monorepo, the Dockerfiles can be nearly identical. The main difference is usually the service-specific build/start target, for example:

```dockerfile
RUN npm run build:hopecard-donor-service
CMD ["node", "dist/apps/hopecard-donor-service/main"]
```

Use one Dockerfile per actual Render service. Do not create Dockerfiles for non-deployable shared folders.

## Render Blueprint Path

For new tribe backend repos, prefer `render.yaml` over per-service deploy hook secrets. `BACKEND_MULTI_SYSTEMS_JSON` tells CI what to build and test; `render.yaml` tells Render what to create and run.

Use deploy hook secrets only as a transition path for repos that already have manually-created Render services.
