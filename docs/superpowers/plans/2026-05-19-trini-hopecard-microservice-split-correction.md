# Trini Hopecard Microservice Split Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Hopecard branch rewrite so Hopecard backend domains are real deployable NestJS monorepo microservices instead of modules bundled inside `apps/api`.

**Architecture:** Keep `apps/api` as the base API/control-plane app and keep `apps/location-service` as the existing location microservice. Move Hopecard persona/domain code into separate deployable Nest applications under `apps/hopecard-*-service`, move reusable runtime pieces into `libs/common`, then rewrite the affected Trini feature branches again so the preserved commit sequence shows the correct service separation.

**Tech Stack:** Git, GitHub CLI, GitHub Actions, PowerShell, NestJS monorepo, Jest, Docker, central reusable backend workflow.

---

## Current Problem

The current rewritten `trini-thrive-be` Hopecard branches pass CI, but the architecture is wrong:

```text
apps/api/src/admin-auth
apps/api/src/admin-beneficiary
apps/api/src/analytics
apps/api/src/approvals
apps/api/src/beneficiary-auth
apps/api/src/beneficiary-health
apps/api/src/campaign-service
apps/api/src/campaigns
apps/api/src/cart
apps/api/src/cm-auth
apps/api/src/donor-auth
apps/api/src/notification-service
apps/api/src/profile
apps/api/src/purchases
apps/api/src/reporting-service
```

That is a modular API app, not separate deployable microservices. The correction must make each deployable service its own Nest app under `apps/*`.

## Non-Negotiable History Rules

- Do not add a public "fix microservices" commit on top of the affected Hopecard branches unless explicitly approved.
- Rebuild the affected branches so the corrected architecture appears inside the same preserved Hopecard commit sequence.
- Preserve the original branch-specific commit messages.
- Preserve the original branch-specific author date, committer date, author identity, and committer identity.
- Preserve the commit order.
- Rewritten commit hashes are allowed to change.
- Pushes must use `--force-with-lease`, never plain `--force`.
- Keep local backup refs before any second rewrite.
- `Develop` and `feat/hopecard-integration` may point to the same final head again if the effective file diff remains identical.

Important tradeoff: one preserved commit message says "consolidate all persona backends into root NestJS app per CICD requirement". Because the requirement says to keep commit messages, this plan keeps that message even though the final corrected tree must show separate deployable services.

## Scope

Primary correction scope:

```text
C:\Codes\secret-ops\trini-thrive-be
branches:
  feat/hopecard-integration
  Develop
```

Audit scope before rewriting:

```text
C:\Codes\secret-ops\campus-one-be
C:\Codes\secret-ops\greenovate-be
C:\Codes\secret-ops\paki-apps-be
C:\Codes\secret-ops\sho-team-be
C:\Codes\secret-ops\smurf-village-be
C:\Codes\secret-ops\template-repo-be-nest
C:\Codes\secret-ops\trini-thrive-be
```

Expected audit result: only `trini-thrive-be` Hopecard branches need a corrective service split. The template and other tribe repos currently only have the base `api` and `location-service` deployables, which is acceptable unless the audit finds domain-specific code incorrectly bundled into `apps/api`.

## Target Structure

The corrected `trini-thrive-be` Hopecard branch should end with this deployable layout:

```text
apps/
  api/
    src/
      api.controller.ts
      api.module.ts
      api.service.ts
      main.ts
    Dockerfile
    tsconfig.app.json

  location-service/
    src/
      location-service.module.ts
      main.ts
      location/
    Dockerfile
    tsconfig.app.json

  hopecard-admin-service/
    src/
      admin-service.module.ts
      main.ts
      auth/
      beneficiary-management/
      analytics/
      approvals/
    Dockerfile
    tsconfig.app.json

  hopecard-beneficiary-service/
    src/
      beneficiary-service.module.ts
      main.ts
      auth/
      beneficiary-health/
    Dockerfile
    tsconfig.app.json

  hopecard-campaign-manager-service/
    src/
      campaign-manager-service.module.ts
      main.ts
      auth/
      campaigns/
      reporting/
    Dockerfile
    tsconfig.app.json

  hopecard-notification-service/
    src/
      notification-service.module.ts
      main.ts
      notifications/
    Dockerfile
    tsconfig.app.json

  hopecard-donor-service/
    src/
      donor-service.module.ts
      main.ts
      auth/
      campaigns/
      cart/
      profile/
      purchases/
    Dockerfile
    tsconfig.app.json

libs/
  api-center/
  common/
    src/
      bootstrap/
        http-app.ts
      gateway/
        gateway.module.ts
      health/
        health.controller.ts
        health.module.ts
        health.service.ts
      filters/
      middleware/
      config/
      decorators/
      guards/
      activity-logger.ts
      email.ts
      storage.ts
      supabase-client.ts
      supabase-helpers.ts
      types.ts
  contracts/
  supabase/
```

## Service Boundary Map

| Current path under `apps/api/src` | Correct target path | Deployable service |
| --- | --- | --- |
| `admin-auth` | `apps/hopecard-admin-service/src/auth` | `hopecard-admin-service` |
| `admin-beneficiary` | `apps/hopecard-admin-service/src/beneficiary-management` | `hopecard-admin-service` |
| `analytics` | `apps/hopecard-admin-service/src/analytics` | `hopecard-admin-service` |
| `approvals` | `apps/hopecard-admin-service/src/approvals` | `hopecard-admin-service` |
| `beneficiary-auth` | `apps/hopecard-beneficiary-service/src/auth` | `hopecard-beneficiary-service` |
| `beneficiary-health` | `apps/hopecard-beneficiary-service/src/beneficiary-health` | `hopecard-beneficiary-service` |
| `cm-auth` | `apps/hopecard-campaign-manager-service/src/auth` | `hopecard-campaign-manager-service` |
| `campaign-service` | `apps/hopecard-campaign-manager-service/src/campaigns` | `hopecard-campaign-manager-service` |
| `reporting-service` | `apps/hopecard-campaign-manager-service/src/reporting` | `hopecard-campaign-manager-service` |
| `notification-service` | `apps/hopecard-notification-service/src/notifications` | `hopecard-notification-service` |
| `donor-auth` | `apps/hopecard-donor-service/src/auth` | `hopecard-donor-service` |
| `campaigns` | `apps/hopecard-donor-service/src/campaigns` | `hopecard-donor-service` |
| `cart` | `apps/hopecard-donor-service/src/cart` | `hopecard-donor-service` |
| `profile` | `apps/hopecard-donor-service/src/profile` | `hopecard-donor-service` |
| `purchases` | `apps/hopecard-donor-service/src/purchases` | `hopecard-donor-service` |
| `gateway` | `libs/common/src/gateway` | shared module imported by apps |
| `health` | `libs/common/src/health` | shared health endpoint imported by apps |

---

## Phase 1: Freeze And Audit

### Task 1: Record Current Rewritten Heads

**Files:**
- Modify: this plan file with execution notes

- [ ] **Step 1: Confirm local branch state**

Run:

```powershell
git -C "C:\Codes\secret-ops\trini-thrive-be" status --short --branch
git -C "C:\Codes\secret-ops\trini-thrive-be" log --oneline --decorate -8
```

Expected:

```text
The working tree is clean before the corrective rewrite starts.
The current rewritten Hopecard branch head is recorded.
```

- [ ] **Step 2: Fetch remote branches**

Run:

```powershell
git -C "C:\Codes\secret-ops\trini-thrive-be" fetch origin --prune
```

Expected:

```text
Remote refs are current before backup refs and force-with-lease checks are made.
```

### Task 2: Audit All Backend Repos For The Same Mistake

**Files:**
- Modify: this plan file with audit results

- [ ] **Step 1: List non-base directories under every `apps/api/src`**

Run:

```powershell
$repos = @(
  'campus-one-be',
  'greenovate-be',
  'paki-apps-be',
  'sho-team-be',
  'smurf-village-be',
  'template-repo-be-nest',
  'trini-thrive-be'
)
foreach ($repo in $repos) {
  $apiSrc = "C:\Codes\secret-ops\$repo\apps\api\src"
  if (Test-Path -LiteralPath $apiSrc) {
    "===== $repo ====="
    Get-ChildItem -LiteralPath $apiSrc -Directory | Select-Object -ExpandProperty Name
  }
}
```

Expected:

```text
The non-Trini repos only show base API directories such as health or no domain-heavy service folders.
Trini shows Hopecard persona/domain folders that require splitting.
```

- [ ] **Step 2: Record whether scope expands**

Append one of these notes:

```markdown
Phase 1 audit result: scope remains `trini-thrive-be` Hopecard branches only.
```

If the audit finds another repo with the same mistake, append a concrete row to this table:

```markdown
| Repo | Branch | Current bundled folder | Required service split |
| --- | --- | --- | --- |
```

---

## Phase 2: Build The Correct Service Shells

### Task 3: Move Shared Runtime Modules Into `libs/common`

**Files:**
- Move: `apps/api/src/gateway/gateway.module.ts` to `libs/common/src/gateway/gateway.module.ts`
- Move: `apps/api/src/health/health.controller.ts` to `libs/common/src/health/health.controller.ts`
- Move: `apps/api/src/health/health.module.ts` to `libs/common/src/health/health.module.ts`
- Move: `apps/api/src/health/health.service.ts` to `libs/common/src/health/health.service.ts`
- Modify: `libs/common/src/index.ts`

- [ ] **Step 1: Move the shared module files**

Use native moves so Git records renames:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
New-Item -ItemType Directory -Force -Path "libs\common\src\gateway", "libs\common\src\health"
Move-Item -LiteralPath "apps\api\src\gateway\gateway.module.ts" -Destination "libs\common\src\gateway\gateway.module.ts"
Move-Item -LiteralPath "apps\api\src\health\health.controller.ts" -Destination "libs\common\src\health\health.controller.ts"
Move-Item -LiteralPath "apps\api\src\health\health.module.ts" -Destination "libs\common\src\health\health.module.ts"
Move-Item -LiteralPath "apps\api\src\health\health.service.ts" -Destination "libs\common\src\health\health.service.ts"
Pop-Location
```

Expected:

```text
The shared health and gateway modules live under `libs/common`.
`apps/api/src/gateway` and `apps/api/src/health` no longer contain deployable app code.
```

- [ ] **Step 2: Export shared modules from `libs/common/src/index.ts`**

Add these exports:

```ts
export * from './gateway/gateway.module.js';
export * from './health/health.module.js';
export * from './health/health.service.js';
```

Expected:

```text
Apps can import `GatewayModule` and `HealthModule` from `@app/common`.
```

### Task 4: Add A Shared HTTP Bootstrap Helper

**Files:**
- Create: `libs/common/src/bootstrap/http-app.ts`
- Modify: `libs/common/src/index.ts`
- Modify: `apps/api/src/main.ts`
- Modify: `apps/location-service/src/main.ts`

- [ ] **Step 1: Create `libs/common/src/bootstrap/http-app.ts`**

```ts
import { Logger, ValidationPipe, type Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter.js';
import {
  BODY_SIZE_LIMIT,
  corsOptions,
  helmetConfig,
  helmetConfigSwagger,
} from '../config/security.config.js';

export interface HttpAppBootstrapOptions {
  module: Type<unknown>;
  loggerName: string;
  swaggerTitle: string;
  swaggerDescription: string;
  defaultPort: number;
}

export async function bootstrapHttpApp(
  options: HttpAppBootstrapOptions,
): Promise<void> {
  const logger = new Logger(options.loggerName);
  const app = await NestFactory.create<NestExpressApplication>(options.module, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER') === 'true';

  app.use(helmet(enableSwagger ? helmetConfigSwagger : helmetConfig));
  app.use(express.json({ limit: BODY_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.enableCors(corsOptions(configService.get<string>('ALLOWED_ORIGINS')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(options.swaggerTitle)
      .setDescription(options.swaggerDescription)
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/v1/docs', app, document);
    logger.log('Swagger docs available at /api/v1/docs');
  }

  const port = configService.get<number>('PORT') ?? options.defaultPort;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on 0.0.0.0:${String(port)}`);
}
```

- [ ] **Step 2: Export the helper**

Add to `libs/common/src/index.ts`:

```ts
export * from './bootstrap/http-app.js';
```

- [ ] **Step 3: Replace each app `main.ts` with a thin bootstrap call**

Use this shape for every HTTP app:

```ts
import { bootstrapHttpApp } from '@app/common';
import { HopecardAdminServiceModule } from './admin-service.module';

void bootstrapHttpApp({
  module: HopecardAdminServiceModule,
  loggerName: 'HopecardAdminService',
  swaggerTitle: 'Hopecard Admin Service',
  swaggerDescription: 'Hopecard admin backend API',
  defaultPort: 4020,
});
```

Expected:

```text
Every service has the same HTTP hardening, CORS, validation, exception filter, Swagger behavior, and global prefix without duplicating the bootstrap code.
```

---

## Phase 3: Split Hopecard Into Deployable Apps

### Task 5: Create Hopecard App Directories And Move Modules

**Files:**
- Create: app folders listed in "Target Structure"
- Move: folders listed in "Service Boundary Map"

- [ ] **Step 1: Create app source directories**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
$dirs = @(
  "apps\hopecard-admin-service\src",
  "apps\hopecard-beneficiary-service\src",
  "apps\hopecard-campaign-manager-service\src",
  "apps\hopecard-notification-service\src",
  "apps\hopecard-donor-service\src"
)
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Pop-Location
```

- [ ] **Step 2: Move Hopecard folders into service apps**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
Move-Item -LiteralPath "apps\api\src\admin-auth" -Destination "apps\hopecard-admin-service\src\auth"
Move-Item -LiteralPath "apps\api\src\admin-beneficiary" -Destination "apps\hopecard-admin-service\src\beneficiary-management"
Move-Item -LiteralPath "apps\api\src\analytics" -Destination "apps\hopecard-admin-service\src\analytics"
Move-Item -LiteralPath "apps\api\src\approvals" -Destination "apps\hopecard-admin-service\src\approvals"
Move-Item -LiteralPath "apps\api\src\beneficiary-auth" -Destination "apps\hopecard-beneficiary-service\src\auth"
Move-Item -LiteralPath "apps\api\src\beneficiary-health" -Destination "apps\hopecard-beneficiary-service\src\beneficiary-health"
Move-Item -LiteralPath "apps\api\src\cm-auth" -Destination "apps\hopecard-campaign-manager-service\src\auth"
Move-Item -LiteralPath "apps\api\src\campaign-service" -Destination "apps\hopecard-campaign-manager-service\src\campaigns"
Move-Item -LiteralPath "apps\api\src\reporting-service" -Destination "apps\hopecard-campaign-manager-service\src\reporting"
Move-Item -LiteralPath "apps\api\src\notification-service" -Destination "apps\hopecard-notification-service\src\notifications"
Move-Item -LiteralPath "apps\api\src\donor-auth" -Destination "apps\hopecard-donor-service\src\auth"
Move-Item -LiteralPath "apps\api\src\campaigns" -Destination "apps\hopecard-donor-service\src\campaigns"
Move-Item -LiteralPath "apps\api\src\cart" -Destination "apps\hopecard-donor-service\src\cart"
Move-Item -LiteralPath "apps\api\src\profile" -Destination "apps\hopecard-donor-service\src\profile"
Move-Item -LiteralPath "apps\api\src\purchases" -Destination "apps\hopecard-donor-service\src\purchases"
Pop-Location
```

Expected:

```text
`apps/api/src` no longer owns Hopecard deployable domains.
Each Hopecard service owns its persona/domain modules.
```

### Task 6: Add Service Root Modules

**Files:**
- Create: `apps/hopecard-admin-service/src/admin-service.module.ts`
- Create: `apps/hopecard-beneficiary-service/src/beneficiary-service.module.ts`
- Create: `apps/hopecard-campaign-manager-service/src/campaign-manager-service.module.ts`
- Create: `apps/hopecard-notification-service/src/notification-service.module.ts`
- Create: `apps/hopecard-donor-service/src/donor-service.module.ts`
- Modify: `apps/api/src/api.module.ts`

- [ ] **Step 1: Use this import foundation in each service module**

Each service module must import:

```ts
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  CorrelationIdMiddleware,
  GatewayModule,
  HealthModule,
  validateEnv,
} from '@app/common';
import { ApiCenterSdkModule } from '@app/api-center';
import { SupabaseModule } from '@app/supabase';

const shouldValidateEnv = process.env.NODE_ENV === 'production';
```

- [ ] **Step 2: Create `admin-service.module.ts`**

```ts
import { AuthModule } from './auth/auth.module';
import { BeneficiariesModule } from './beneficiary-management/beneficiaries.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ApprovalsModule } from './approvals/approvals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    AuthModule,
    BeneficiariesModule,
    AnalyticsModule,
    ApprovalsModule,
  ],
})
export class HopecardAdminServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 3: Create `beneficiary-service.module.ts`**

```ts
import { AuthModule } from './auth/auth.module';
import { HealthModule as BeneficiaryHealthModule } from './beneficiary-health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    AuthModule,
    BeneficiaryHealthModule,
  ],
})
export class HopecardBeneficiaryServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 4: Create `campaign-manager-service.module.ts`**

```ts
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ReportingModule } from './reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    AuthModule,
    CampaignsModule,
    ReportingModule,
  ],
})
export class HopecardCampaignManagerServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 5: Create `notification-service.module.ts`**

```ts
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    NotificationsModule,
  ],
})
export class HopecardNotificationServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 6: Create `donor-service.module.ts`**

```ts
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CartModule } from './cart/cart.module';
import { ProfileModule } from './profile/profile.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    AuthModule,
    CampaignsModule,
    CartModule,
    ProfileModule,
    PurchasesModule,
  ],
})
export class HopecardDonorServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 7: Remove Hopecard imports from `apps/api/src/api.module.ts`**

After this step, `ApiModule` should import only base API concerns:

```ts
ConfigModule.forRoot(...)
SupabaseModule
HealthModule
ApiCenterSdkModule
GatewayModule
```

Expected:

```text
`apps/api` no longer boots admin, beneficiary, campaign manager, notification, or donor modules.
```

---

## Phase 4: Wire Build, Test, Docker, And Deployment Metadata

### Task 7: Register New Nest Projects

**Files:**
- Modify: `nest-cli.json`
- Create: `apps/hopecard-admin-service/tsconfig.app.json`
- Create: `apps/hopecard-beneficiary-service/tsconfig.app.json`
- Create: `apps/hopecard-campaign-manager-service/tsconfig.app.json`
- Create: `apps/hopecard-notification-service/tsconfig.app.json`
- Create: `apps/hopecard-donor-service/tsconfig.app.json`

- [ ] **Step 1: Add one Nest project per deployable app**

Add these project keys to `nest-cli.json`:

```json
"hopecard-admin-service": {
  "type": "application",
  "root": "apps/hopecard-admin-service",
  "entryFile": "main",
  "sourceRoot": "apps/hopecard-admin-service/src",
  "compilerOptions": {
    "tsConfigPath": "apps/hopecard-admin-service/tsconfig.app.json"
  }
}
```

Repeat the same shape for:

```text
hopecard-beneficiary-service
hopecard-campaign-manager-service
hopecard-notification-service
hopecard-donor-service
```

- [ ] **Step 2: Add service `tsconfig.app.json` files**

Use this exact shape, changing only the `outDir`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/hopecard-admin-service"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

Expected:

```text
`nest build <service>` emits each app to `dist/apps/<service>`.
```

### Task 8: Add Package Scripts And Jest Projects

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add build/start/prod scripts**

Add scripts for each service:

```json
"build:hopecard-admin-service": "nest build hopecard-admin-service",
"start:hopecard-admin-service": "nest start hopecard-admin-service",
"start:hopecard-admin-service:dev": "nest start hopecard-admin-service --watch",
"start:prod:hopecard-admin-service": "node dist/apps/hopecard-admin-service/main"
```

Repeat for:

```text
hopecard-beneficiary-service
hopecard-campaign-manager-service
hopecard-notification-service
hopecard-donor-service
```

- [ ] **Step 2: Add Jest project entries**

Each new Jest project must use:

```json
{
  "displayName": "hopecard-admin-service",
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": "(apps/hopecard-admin-service|libs)/(.*)\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@app/common$": "<rootDir>/libs/common/src",
    "^@app/common/(.*)$": "<rootDir>/libs/common/src/$1",
    "^@app/api-center$": "<rootDir>/libs/api-center/src",
    "^@app/api-center/(.*)$": "<rootDir>/libs/api-center/src/$1",
    "^@app/supabase$": "<rootDir>/libs/supabase/src",
    "^@app/supabase/(.*)$": "<rootDir>/libs/supabase/src/$1",
    "^@app/contracts$": "<rootDir>/libs/contracts/src",
    "^@app/contracts/(.*)$": "<rootDir>/libs/contracts/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  "collectCoverageFrom": [
    "apps/hopecard-admin-service/src/**/*.ts",
    "libs/**/*.ts"
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "apps/hopecard-admin-service/src/main.ts",
    "\\.module\\.ts$",
    "index\\.ts$"
  ],
  "testEnvironment": "node"
}
```

Repeat the same shape for every new service.

Expected:

```text
CI can run service-specific test commands with `jest --selectProjects <service>`.
```

### Task 9: Add Per-Service Dockerfiles

**Files:**
- Create: `apps/hopecard-admin-service/Dockerfile`
- Create: `apps/hopecard-beneficiary-service/Dockerfile`
- Create: `apps/hopecard-campaign-manager-service/Dockerfile`
- Create: `apps/hopecard-notification-service/Dockerfile`
- Create: `apps/hopecard-donor-service/Dockerfile`

- [ ] **Step 1: Copy the existing service Dockerfile pattern**

Use this shape for `apps/hopecard-admin-service/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc ./
RUN --mount=type=secret,id=GITHUB_TOKEN \
  GITHUB_TOKEN="$(cat /run/secrets/GITHUB_TOKEN)" npm ci

COPY tsconfig*.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm run build:hopecard-admin-service

FROM node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json .npmrc ./
RUN --mount=type=secret,id=GITHUB_TOKEN \
  apk upgrade --no-cache zlib \
  && GITHUB_TOKEN="$(cat /run/secrets/GITHUB_TOKEN)" npm ci --omit=dev \
  && rm .npmrc package-lock.json \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist

USER nestjs

EXPOSE 4020

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4020/api/v1/health', (res) => { if (res.statusCode !== 200) process.exit(1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/apps/hopecard-admin-service/main"]
```

Use these default ports:

```text
hopecard-admin-service: 4020
hopecard-beneficiary-service: 4021
hopecard-campaign-manager-service: 4022
hopecard-notification-service: 4023
hopecard-donor-service: 4024
```

Expected:

```text
Each microservice has its own container build target and production start command.
```

### Task 10: Update Backend Systems JSON

**Files:**
- Modify: GitHub repository variable `BACKEND_MULTI_SYSTEMS_JSON` for `ImplementSprint/trini-thrive-be`

- [ ] **Step 1: Generate the corrected service matrix**

Use one JSON object per deployable app:

```json
[
  {
    "name": "trini-thrive-be-api",
    "project": "api",
    "dir": ".",
    "install_dir": ".",
    "image": "ghcr.io/implementsprint/trini-thrive-be-api",
    "version_stream": "api",
    "backend_stack": "nestjs",
    "test_command": "npm run test:cov -- --selectProjects api",
    "build_command": "npm run build:api",
    "dockerfile_path": "apps/api/Dockerfile",
    "k6_script_path": "tests/performance",
    "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
  },
  {
    "name": "trini-thrive-be-location-service",
    "project": "location-service",
    "dir": ".",
    "install_dir": ".",
    "image": "ghcr.io/implementsprint/trini-thrive-be-location-service",
    "version_stream": "location-service",
    "backend_stack": "nestjs",
    "test_command": "npm run test:cov -- --selectProjects location-service",
    "build_command": "npm run build:location-service",
    "dockerfile_path": "apps/location-service/Dockerfile",
    "k6_script_path": "tests/performance/location-service-smoke.js",
    "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
  },
  {
    "name": "trini-thrive-be-hopecard-admin-service",
    "project": "hopecard-admin-service",
    "dir": ".",
    "install_dir": ".",
    "image": "ghcr.io/implementsprint/trini-thrive-be-hopecard-admin-service",
    "version_stream": "hopecard-admin-service",
    "backend_stack": "nestjs",
    "test_command": "npm run test:cov -- --selectProjects hopecard-admin-service",
    "build_command": "npm run build:hopecard-admin-service",
    "dockerfile_path": "apps/hopecard-admin-service/Dockerfile",
    "k6_script_path": "tests/performance/hopecard-admin-service-smoke.js",
    "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
  }
]
```

Continue the JSON array with these concrete service entries:

```json
{
  "name": "trini-thrive-be-hopecard-beneficiary-service",
  "project": "hopecard-beneficiary-service",
  "dir": ".",
  "install_dir": ".",
  "image": "ghcr.io/implementsprint/trini-thrive-be-hopecard-beneficiary-service",
  "version_stream": "hopecard-beneficiary-service",
  "backend_stack": "nestjs",
  "test_command": "npm run test:cov -- --selectProjects hopecard-beneficiary-service",
  "build_command": "npm run build:hopecard-beneficiary-service",
  "dockerfile_path": "apps/hopecard-beneficiary-service/Dockerfile",
  "k6_script_path": "tests/performance/hopecard-beneficiary-service-smoke.js",
  "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
},
{
  "name": "trini-thrive-be-hopecard-campaign-manager-service",
  "project": "hopecard-campaign-manager-service",
  "dir": ".",
  "install_dir": ".",
  "image": "ghcr.io/implementsprint/trini-thrive-be-hopecard-campaign-manager-service",
  "version_stream": "hopecard-campaign-manager-service",
  "backend_stack": "nestjs",
  "test_command": "npm run test:cov -- --selectProjects hopecard-campaign-manager-service",
  "build_command": "npm run build:hopecard-campaign-manager-service",
  "dockerfile_path": "apps/hopecard-campaign-manager-service/Dockerfile",
  "k6_script_path": "tests/performance/hopecard-campaign-manager-service-smoke.js",
  "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
},
{
  "name": "trini-thrive-be-hopecard-notification-service",
  "project": "hopecard-notification-service",
  "dir": ".",
  "install_dir": ".",
  "image": "ghcr.io/implementsprint/trini-thrive-be-hopecard-notification-service",
  "version_stream": "hopecard-notification-service",
  "backend_stack": "nestjs",
  "test_command": "npm run test:cov -- --selectProjects hopecard-notification-service",
  "build_command": "npm run build:hopecard-notification-service",
  "dockerfile_path": "apps/hopecard-notification-service/Dockerfile",
  "k6_script_path": "tests/performance/hopecard-notification-service-smoke.js",
  "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
},
{
  "name": "trini-thrive-be-hopecard-donor-service",
  "project": "hopecard-donor-service",
  "dir": ".",
  "install_dir": ".",
  "image": "ghcr.io/implementsprint/trini-thrive-be-hopecard-donor-service",
  "version_stream": "hopecard-donor-service",
  "backend_stack": "nestjs",
  "test_command": "npm run test:cov -- --selectProjects hopecard-donor-service",
  "build_command": "npm run build:hopecard-donor-service",
  "dockerfile_path": "apps/hopecard-donor-service/Dockerfile",
  "k6_script_path": "tests/performance/hopecard-donor-service-smoke.js",
  "k6_run_only_on_branch": "__disabled_until_k6_base_url__"
}
```

- [ ] **Step 2: Set the repo variable after the corrected branch is ready**

Run after code verification, not before:

```powershell
gh variable set BACKEND_MULTI_SYSTEMS_JSON `
  --repo "ImplementSprint/trini-thrive-be" `
  --body (Get-Content -LiteralPath "C:\tmp\trini-backend-systems.json" -Raw)
```

Expected:

```text
The backend workflow matrix builds, tests, scans, packages, and optionally deploys each service independently.
```

---

## Phase 5: Rewrite The Affected Branch Histories Again

### Task 11: Create Backup Refs For Current Pushed Heads

**Files:**
- Modify: local Git backup refs in `trini-thrive-be`
- Modify: this plan file with backup ref names

- [ ] **Step 1: Back up the currently pushed wrong-service-split heads**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$branches = @('feat/hopecard-integration', 'Develop')
foreach ($branch in $branches) {
  $safeBranch = $branch -replace '[^A-Za-z0-9._-]', '_'
  $backupRef = "refs/backup/hopecard-service-split-correction/$timestamp/$safeBranch"
  git update-ref $backupRef "origin/$branch"
  "$branch backed up at $backupRef"
}
Pop-Location
```

Expected:

```text
Both current remote branch heads are recoverable locally before rewriting them again.
```

### Task 12: Rebuild `feat/hopecard-integration` With Corrected Service Split

**Files:**
- Modify: `trini-thrive-be` branch history

- [ ] **Step 1: Start from fixed main**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git fetch origin --prune
git switch --force-create "rewrite/hopecard-service-split-v2" origin/main
Pop-Location
```

- [ ] **Step 2: Replay the same preserved commits oldest-to-newest**

Use the same original Hopecard commit list:

```text
f18ccc7 feat(hopecard): extract and integrate all four persona backends
44b4756 fix(hopecard): cross-check fixes - CM hardcoded ports, Beneficiary fallback, eslint configs
0a6a173 test(hopecard): add unit tests to meet 80% coverage gate across all personas
9ed76c8 chore(hopecard): exclude Admin and Digital Donor from SonarCloud coverage gate
4652a34 fix(hopecard): move persona backends from hopecard/ to src/hopecard/ per CICD requirement
358b234 fix(hopecard): consolidate all persona backends into root NestJS app per CICD requirement
83173ce Update health.service.ts
314feb2 feat(hopecard): add persona and system claims to admin-auth JWT
```

Replay rule:

```text
After each cherry-pick --no-commit, normalize the working tree to the target service structure before creating the replacement commit with git commit -C <original>.
Do not make one extra cleanup commit at the end.
```

- [ ] **Step 3: Preserve metadata when creating each replacement commit**

Run the metadata-preserving commit wrapper for every commit:

```powershell
function Invoke-TimelinePreservingCommit {
  param(
    [Parameter(Mandatory = $true)][string]$Commit
  )

  $env:GIT_AUTHOR_NAME = git show -s --format=%an $Commit
  $env:GIT_AUTHOR_EMAIL = git show -s --format=%ae $Commit
  $env:GIT_AUTHOR_DATE = git show -s --format=%aI $Commit
  $env:GIT_COMMITTER_NAME = git show -s --format=%cn $Commit
  $env:GIT_COMMITTER_EMAIL = git show -s --format=%ce $Commit
  $env:GIT_COMMITTER_DATE = git show -s --format=%cI $Commit

  git commit -C $Commit
  if ($LASTEXITCODE -ne 0) { throw "commit failed for $Commit" }

  Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
}
```

Expected:

```text
The visible commit timeline and messages match the original Hopecard branch, but the final tree is true app-per-service NestJS monorepo architecture.
```

### Task 13: Point `Develop` At The Corrected Head If Still Equivalent

**Files:**
- Modify: `trini-thrive-be` branch history

- [ ] **Step 1: Compare original effective diffs**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git diff --name-status "origin/feat/hopecard-integration..origin/Develop"
Pop-Location
```

Expected:

```text
If diff is empty, `Develop` can point to the same corrected head as `feat/hopecard-integration`.
If diff is not empty, replay the additional production commits onto a separate `rewrite/Develop-service-split-v2` branch with the same metadata rules.
```

---

## Phase 6: Verify Locally And In GitHub Actions

### Task 14: Local Verification

**Files:**
- Modify: none unless verification reveals a real code issue

- [ ] **Step 1: Run repo verification**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
npm run lint -- --quiet
npm run typecheck
npm run build
npm run test:cov -- --runInBand --silent
git diff --check HEAD
Pop-Location
```

Expected:

```text
All commands exit 0 when dependencies are installed.
If local install cannot authenticate to GitHub Packages for `@implementsprint/sdk`, record that limitation and rely on GitHub Actions because the repo secret already provides the token there.
```

- [ ] **Step 2: Build every service container when Docker is available**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
$services = @(
  'api',
  'location-service',
  'hopecard-admin-service',
  'hopecard-beneficiary-service',
  'hopecard-campaign-manager-service',
  'hopecard-notification-service',
  'hopecard-donor-service'
)
foreach ($service in $services) {
  docker build -f "apps/$service/Dockerfile" -t "trini-thrive-be-$service`:local" .
}
Pop-Location
```

Expected:

```text
Each service builds as a separate image.
```

### Task 15: Push With Lease Protection

**Files:**
- Modify: remote branches `feat/hopecard-integration` and `Develop`

- [ ] **Step 1: Push corrected feature branch**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git push --force-with-lease origin "rewrite/hopecard-service-split-v2:feat/hopecard-integration"
Pop-Location
```

- [ ] **Step 2: Push corrected Develop branch**

If `Develop` is equivalent:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git push --force-with-lease origin "rewrite/hopecard-service-split-v2:Develop"
Pop-Location
```

If `Develop` needed extra commits:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
git push --force-with-lease origin "rewrite/Develop-service-split-v2:Develop"
Pop-Location
```

Expected:

```text
Both affected branches now show true NestJS monorepo microservice structure.
```

### Task 16: Run GitHub Actions Dry Runs

**Files:**
- Modify: this plan file with run IDs and conclusions

- [ ] **Step 1: Dispatch branch dry runs**

Run:

```powershell
foreach ($branch in @('feat/hopecard-integration', 'Develop')) {
  gh workflow run "BE Pipeline Caller" `
    --repo "ImplementSprint/trini-thrive-be" `
    --ref $branch `
    -f pipeline_mode=multi `
    -f enable_security_scan=true `
    -f enable_sonar=true `
    -f enable_k6=true `
    -f k6_script_path=tests/performance `
    -f k6_base_url= `
    -f k6_run_only_on_branch=__disabled_until_k6_base_url__ `
    -f run_deploy=false `
    -f run_promotion=false `
    -f dry_run=true
}
```

- [ ] **Step 2: Watch runs to completion**

Run:

```powershell
$runs = gh run list `
  --repo "ImplementSprint/trini-thrive-be" `
  --workflow "BE Pipeline Caller" `
  --limit 10 `
  --json databaseId,headBranch,status,conclusion,url |
  ConvertFrom-Json |
  Where-Object { $_.headBranch -in @('Develop','feat/hopecard-integration') } |
  Select-Object -First 2

foreach ($run in $runs) {
  gh run watch $run.databaseId --repo "ImplementSprint/trini-thrive-be" --exit-status
  gh run view $run.databaseId --repo "ImplementSprint/trini-thrive-be" --json status,conclusion,url,jobs
}
```

Expected:

```text
Both dry runs complete successfully.
The workflow matrix contains separate jobs for API, location service, and each Hopecard service.
```

---

## Phase 7: Closeout

### Task 17: Record Final Evidence

**Files:**
- Modify: this plan file
- Modify: existing execution plan only if needed to cross-link this correction

- [ ] **Step 1: Add final branch table**

Generate the branch rows with actual commits and run URLs:

```powershell
Push-Location "C:\Codes\secret-ops\trini-thrive-be"
$featureHead = git rev-parse --short=12 origin/feat/hopecard-integration
$developHead = git rev-parse --short=12 origin/Develop
"| Branch | Old Wrong-Split Head | Corrected Head | CI Run | Result |"
"| --- | --- | --- | --- | --- |"
"| ``feat/hopecard-integration`` | ``b27635bd976e`` | ``$featureHead`` | paste GitHub Actions run URL from Phase 6 | ``success`` |"
"| ``Develop`` | ``b27635bd976e`` | ``$developHead`` | paste GitHub Actions run URL from Phase 6 | ``success`` |"
Pop-Location
```

Expected:

```text
The table records `b27635bd976e` as the old wrong-split head and records the actual corrected branch heads after the second force-with-lease push.
```

- [ ] **Step 2: Commit and push the central plan record**

Run:

```powershell
Push-Location "C:\Codes\secret-ops\central-workflow"
git add docs/superpowers/plans/2026-05-19-trini-hopecard-microservice-split-correction.md
git commit --no-gpg-sign -m "docs: plan trini hopecard microservice split correction"
git push origin main
Pop-Location
```

Expected:

```text
The correction plan and final evidence are available from central-workflow.
```

## Acceptance Checklist

- [x] `apps/api` no longer imports Hopecard persona/domain modules.
- [x] Every Hopecard persona/domain service has its own `apps/<service>/src/main.ts`.
- [x] Every Hopecard service has its own Nest project in `nest-cli.json`.
- [x] Every Hopecard service has its own `tsconfig.app.json`.
- [x] Every Hopecard service has its own Dockerfile.
- [x] `package.json` has service-specific build, start, prod start, and Jest project entries.
- [x] `BACKEND_MULTI_SYSTEMS_JSON` has one entry per deployable service.
- [x] The corrected branch history preserves original Hopecard commit messages and timeline.
- [x] Pushes used `--force-with-lease`.
- [x] GitHub Actions dry runs pass for `feat/hopecard-integration` and `Develop`.

## Execution Record

2026-05-19 audit: scope stayed on `trini-thrive-be`. `campus-one-be`, `greenovate-be`, `paki-apps-be`, `sho-team-be`, `smurf-village-be`, and `template-repo-be-nest` only had base `health` under `apps/api/src`; only Trini had Hopecard domain folders bundled under `apps/api/src`.

2026-05-19 backup refs:

| Branch | Backup Ref | Backup Commit |
| --- | --- | --- |
| `feat/hopecard-integration` | `refs/backup/hopecard-service-split-correction/20260519-052654/feat_hopecard-integration` | `b27635bd976e` |
| `Develop` | `refs/backup/hopecard-service-split-correction/20260519-052654/Develop` | `b27635bd976e` |

2026-05-19 implementation: moved Hopecard code out of `apps/api/src` into five deployable apps:

```text
apps/hopecard-admin-service
apps/hopecard-beneficiary-service
apps/hopecard-campaign-manager-service
apps/hopecard-notification-service
apps/hopecard-donor-service
```

Shared `gateway` and `health` modules now live under `libs/common/src`. `apps/api/src` now contains only base API files: `api.controller.ts`, `api.module.ts`, `api.service.ts`, their specs, and `main.ts`.

2026-05-19 backend systems variable: set `BACKEND_MULTI_SYSTEMS_JSON` on `ImplementSprint/trini-thrive-be` to include seven deployable systems: `api`, `location-service`, and the five Hopecard services.

2026-05-19 history rewrite result:

| Branch | Old Wrong-Split Head | Corrected Head | Push Method |
| --- | --- | --- | --- |
| `feat/hopecard-integration` | `b27635bd976e` | `cc107fa88683` | `git push --force-with-lease` |
| `Develop` | `b27635bd976e` | `cc107fa88683` | `git push --force-with-lease` |

The branch still has eight visible commits after `origin/main`. The final commit message remains `feat(hopecard): add persona and system claims to admin-auth JWT`, with author date and committer date preserved at `2026-05-18T17:32:58+08:00`.

2026-05-19 verification:

| Check | Result | Note |
| --- | --- | --- |
| `npm run lint -- --quiet` | pass | local |
| `git diff --check HEAD` | pass | local |
| `npm run test:api -- --runInBand --silent` | pass | local, 133 tests |
| `npm run typecheck` | blocked locally | local `node_modules` misses packages installed in GitHub Actions, including `jose`, `nodemailer`, `@nestjs/axios`, `@nestjs/throttler`, and `@types/multer` |
| `npm run build:api` | blocked locally | local `node_modules` misses `jose` and `@nestjs/throttler`; GitHub Actions installs these with the repo token |
| `npm run test:hopecard-admin-service -- --runInBand --silent` | blocked locally | local `node_modules` misses `jose`; GitHub Actions install passed |

2026-05-19 CI dry-runs:

| Branch | Workflow Run | Result |
| --- | --- | --- |
| `feat/hopecard-integration` | [26061974613](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26061974613) | `success`, head `cc107fa886835347902dc2031fef3f950c3e0d86` |
| `Develop` | [26061976547](https://github.com/ImplementSprint/trini-thrive-be/actions/runs/26061976547) | `success`, head `cc107fa886835347902dc2031fef3f950c3e0d86` |

The CI matrix ran unit tests, SonarCloud analysis, dependency audits, license compliance, and k6 branch-gated preparation for all seven deployable systems.
