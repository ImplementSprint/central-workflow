# User Stories Status Tracker (Jira Copy Version)

Use this file as a quick checklist before updating Jira.

## Legend

- `[x]` Done
- `[~]` In Progress / Partially Done
- `[ ]` Not Done Yet

> Note: Statuses below are based on current central workflow repo + latest team updates. Adjust per tribe in Jira as needed.

---

## Phase 1 — Foundation & Repository Strategy

- [x] ~~Create GitHub organization for all tribes~~
- [x] ~~Configure tribe-based GitHub teams/access structure~~
- [x] ~~Define/enforce repo governance direction and naming consistency~~
- [x] ~~Manage tribe permissions and protected access model~~
- [~] Centralized API/middleware discovery across tribes
- [~] Clear developer onboarding for branching/docking/middleware flow
- [x] ~~Developer push isolation by repository/tribe model~~
- [~] Permission sync automation by tribe assignment

## Phase 2 — Development & Environment Setup

- [x] ~~Create front-end CI/CD template/caller patterns~~
- [~] Create back-end project template standardization
- [x] ~~Create mobile CI/CD template/caller patterns~~
- [x] ~~Include pipeline configs in templates/workflows~~
- [~] Include/standardize folder structures across all tribe repos
- [~] One-click project initialization from templates
- [x] ~~Enforce branch protection on protected branches~~
- [~] Enforce PR approval policy (e.g., 2 approvals) across all repos
- [x] ~~Mobile repository support for React Native + Kotlin paths~~
- [~] API key security and DB consistency integration baseline

## Phase 3 — Pipeline, Testing & Staging

- [x] ~~Reusable GitHub Actions workflow framework~~
- [x] ~~Automatic workflow triggers on PR/push flow~~
- [~] Centralized workflow secret management hardening
- [x] ~~Frontend automated tests/lint/coverage gates~~
- [x] ~~Build failures block promotion path~~
- [x] ~~Frontend build + deployment reusable flow (Vercel)~~
- [x] ~~Backend Jest/integration/security/lint workflow foundations~~
- [x] ~~Parallelized job design in orchestrators~~
- [~] API contract testing standard
- [x] ~~Mobile unit test + Gradle + Detox workflow foundations~~
- [~] iOS artifact/release path completion
- [~] Unified automated test reporting across streams
- [x] ~~Version-tag-driven release support~~
- [~] Pipeline duration/cost analytics

## Phase 4 — Code Quality & Security

- [~] SonarCloud integration for FE/BE/mobile across all repos
- [ ] SonarCloud PR comment feedback standard
- [~] Quality gate visibility and enforcement consistency
- [~] Security rule/hotspot enforcement consistency
- [~] Automated code smell/complexity/duplication reporting adoption
- [ ] Quality gate approval workflow policy
- [~] Pass/fail threshold standardization across all tribes

## Phase 5 — Container & Build Management

- [x] ~~Backend Docker build pipeline foundations~~
- [x] ~~Image tagging strategy (SHA/version stream)~~
- [x] ~~Push images to GHCR~~
- [x] ~~Container vulnerability scanning integrated~~
- [x] ~~Frontend Vercel deployment pipeline baseline~~
- [x] ~~Build logs available in GitHub Actions~~
- [x] ~~Preview deployment support (where configured)~~
- [~] Deployment URL comment consistency per repo
- [x] ~~Mobile Gradle build automation baseline~~
- [~] Signed production artifact process
- [x] ~~Detox E2E on emulator baseline~~
- [~] Flaky-test detection and screenshot/report enrichment

## Phase 6 — Staging / Pre-Production Deployment

- [~] Staging environment parity with production
- [~] Auto-deploy policy from protected branches per repo type
- [~] Staging URL documentation consistency
- [~] FE/BE/mobile packaging and distribution standard for pre-prod
- [ ] APK upload to GitHub Releases standardization
- [ ] Automated release notes generation
- [~] Health checks/log access for staging deployments

## Phase 7 — Testing & Quality Assurance

- [~] UAT + E2E automation in staging
- [~] Selenium for critical flows (baseline exists; full rollout pending)
- [ ] Nightly UAT schedule standard
- [~] Test reports/screenshots consistency
- [~] Grafana k6 load testing integration (baseline integrated in mobile/FE orchestrators; tribe-by-tribe rollout pending)
- [~] Performance threshold gates before production (baseline gate wired in mobile/FE; threshold calibration and full rollout pending per tribe)
- [ ] Consolidated cross-repo QA dashboard/reporting

## Phase 8 — Handoff to Production

- [x] ~~Production readiness gate workflow baseline~~
- [~] Sign-off documentation/checklist standardization
- [x] ~~Audit log generation baseline~~
- [ ] Immutable approval history design
- [~] Rollback procedure and one-click rollback maturity
- [~] Rollback documentation per tribe

## Phase 9 — Monitoring & Notifications

- [x] ~~Pipeline notification workflow baseline (Slack/Discord)~~
- [~] Rich error-detail and routing per tribe
- [~] Approval reminder/notification flows
- [ ] Deployment dashboard across all tribes/repos
- [ ] Staging uptime/error monitoring dashboard and alerts

## API-Center & Routing (Planned)

- [ ] API naming convention standard (tribe-owned/shared)
- [ ] Gateway routing policy (tribe, shared, cross-tribe)
- [ ] API registry/service catalog
- [ ] API registry search/discovery
- [ ] CI/CD automation for API registration

## Missing User Stories to Add (Not Yet Explicitly Captured)

### Identity, Access, and Tenanting (Descope)

- [ ] As a Platform Admin, I want each tribe provisioned as a tenant so that users, roles, and access boundaries are isolated by tribe. *(Epic: Identity & Access Management)*
- [ ] As a Tribe Lead, I want tenant-scoped role templates (lead/dev/qa) so that access setup is consistent and fast. *(Epic: Identity & Access Management)*
- [ ] As a Security/Compliance officer, I want MFA enforced for privileged roles so that account compromise risk is reduced. *(Epic: Security Rules and Quality Gates)*
- [ ] As a Platform Admin, I want automatic deprovisioning when members leave a tribe so that stale access is removed. *(Epic: Identity & Access Management)*
- [ ] As a DevOps Engineer, I want CI to validate Descope issuer/audience/scope before deploy so that only valid auth configuration is promoted. *(Epic: Pipeline Triggers and Automation)*

### CI/CD Governance and Reliability

- [ ] As a Platform Admin, I want environment-specific secrets rotation checks so that expired credentials do not break deployments. *(Epic: Github Actions Workflow Template)*
- [ ] As a DevOps Engineer, I want a runner policy (hosted vs self-hosted per workload) so that cost and security are balanced. *(Epic: Pipeline Performance Optimization)*
- [ ] As a Security Engineer, I want high-risk jobs to run only on approved runners so that sensitive workloads are controlled. *(Epic: Security Rules and Quality Gates)*
- [ ] As a Tribe Lead, I want required checks standardized across all repos so that quality gates are consistent. *(Epic: Quality Approval Workflows)*
- [ ] As a Developer, I want reusable rollback playbooks linked in failed runs so that incident recovery is faster. *(Epic: Staging Rollback Procedures)*

### SonarCloud and Quality Policy

- [ ] As a Platform Admin, I want a SonarCloud policy matrix by repo type so that required rules are clear for FE/BE/mobile. *(Epic: SonarCloud Integration)*
- [ ] As a Tech Lead, I want PR decoration and quality gate status mandatory on protected branches so that risky merges are blocked. *(Epic: SonarCloud Integration)*
- [ ] As a Security/Compliance officer, I want security hotspot triage SLAs so that vulnerabilities are resolved within target windows. *(Epic: Security Rules and Quality Gates)*
- [ ] As a DevOps Engineer, I want a decision record for SonarCloud Free vs Pro so that budget and feature tradeoffs are documented. *(Epic: SonarCloud Integration)*

### Privacy, Data, and Compliance

- [ ] As a Platform Admin, I want a repository visibility classification (private/internal/public) so that each project meets data sensitivity requirements. *(Epic: Identity & Access Management)*
- [ ] As a Security/Compliance officer, I want policy-as-code checks for prohibited public repos so that accidental exposure is prevented. *(Epic: Security Rules and Quality Gates)*
- [ ] As a Back-End Developer, I want API/data classification tags in CI so that protected services enforce stricter controls. *(Epic: DB Integration and Security)*

### QA, Performance, and Reporting

- [ ] As a QA Lead, I want Selenium Grid execution profiles (Chrome/Firefox/Edge) so that browser compatibility is verified systematically. *(Epic: Test Automation (UAT, E2E, Load))*
- [ ] As a Performance Engineer, I want Grafana k6 tests integrated into pre-prod gates so that regressions are caught before production. *(Epic: Load Testing (Grafana k6))*
- [ ] As a Product Manager, I want a consolidated release readiness report (tests, quality, security, deploy) so that go/no-go decisions are faster. *(Epic: Test Reporting and Analytics)*
- [ ] As a Platform Admin, I want tribe-level DORA-style metrics dashboards so that delivery and reliability trends are visible. *(Epic: Deployment Dashboards)*

## Additional User Stories (Already Done but Not Previously Added)

- [x] ~~As a DevOps Engineer, I want standardized workflow timeouts so that stuck CI jobs fail fast and do not block queues.~~ *(Epic: Pipeline Performance Optimization)*
- [x] ~~As a Security Engineer, I want explicit least-privilege workflow permissions so that pipelines only get the access they need.~~ *(Epic: Security Rules and Quality Gates)*
- [x] ~~As a Front-End Lead, I want a frontend standards check (Next.js + strict TypeScript) so that all tribe frontend repos follow baseline architecture.~~ *(Epic: Frontend Pipeline)*
- [x] ~~As a Mobile Developer, I want package-manager-aware CI installs (`npm`, `yarn`, `pnpm`) so that mobile pipelines run reliably across different repo setups.~~ *(Epic: Mobile Pipeline)*
- [x] ~~As a Mobile Architect, I want stack-aware mobile orchestration (React Native/Expo vs Kotlin) so that each mobile system follows the correct build/test path automatically.~~ *(Epic: Mobile Dev Environment)*
- [x] ~~As a Security/Compliance officer, I want production-gate audit logs generated in CI so that release approvals are traceable.~~ *(Epic: Audit Logging & Compliance)*
- [x] ~~As a Platform Admin, I want reusable FE and mobile caller templates (single and multi mode) so that tribe onboarding to central CI/CD is faster and consistent.~~ *(Epic: Repository Templates)*
- [x] ~~As a DevOps Engineer, I want notification workflows with channel support so that tribes receive pipeline status updates consistently.~~ *(Epic: Pipeline Notifications)*
- [x] ~~As a Release Manager, I want promotion PR automation between protected branches so that release transitions are controlled and repeatable.~~ *(Epic: Production Readiness Gate)*
- [x] ~~As a Platform Admin, I want stream-based version tagging so that release artifacts can be traced per system/stream.~~ *(Epic: Pipeline Triggers and Automation)*

---

## Quick Jira Update Block (Copy/Paste)

- Done this sprint: reusable workflows, branch protection/promotion model, FE/BE/mobile CI/CD foundations, Docker+GHCR+security scan baseline, production gate/audit baseline.
- In progress: Sonar policy standardization, Selenium/Grid rollout, staging parity, Campus One call-flow refinement and backend/function completion.
- Pending decisions: SonarCloud Free vs Pro, hosted vs self-hosted runners, repo privacy policy, Vercel cost ownership, disk scope ownership.
