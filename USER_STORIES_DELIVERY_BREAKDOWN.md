# User Stories Delivery Breakdown

Source: USER_STORIES_STATUS.md
Last Updated: 2026-03-13

This file reorganizes the existing user stories into clear delivery buckets:
- Stories done
- Stories not done yet (includes in-progress and not-started)
- Stories done before being formally added (missing but already done)
- Stories not yet added and still not done
- Refactor/standardization stories (with status)

## Story Point Scale
- 2 = very small
- 3 = small
- 5 = medium
- 8 = large

## 1) Stories Done

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| D-01 | Create GitHub organization for all tribes | Foundation: Repository & Access Strategy | 3 | Done |
| D-02 | Configure tribe-based GitHub teams/access structure | Foundation: Repository & Access Strategy | 5 | Done |
| D-03 | Define/enforce repo governance direction and naming consistency | Repository Governance | 5 | Done |
| D-04 | Manage tribe permissions and protected access model | Repository Governance | 5 | Done |
| D-05 | Developer push isolation by repository/tribe model | Repository Governance | 3 | Done |
| D-06 | Create front-end CI/CD template/caller patterns | Frontend Pipeline | 5 | Done |
| D-07 | Create mobile CI/CD template/caller patterns | Mobile Pipeline | 5 | Done |
| D-08 | Include pipeline configs in templates/workflows | Repository Templates | 3 | Done |
| D-09 | Enforce branch protection on protected branches | Branch Governance & Protection | 3 | Done |
| D-10 | Mobile repository support for React Native + Kotlin paths | Mobile Dev Environment | 5 | Done |
| D-11 | Reusable GitHub Actions workflow framework | GitHub Actions Workflow Template | 8 | Done |
| D-12 | Automatic workflow triggers on PR/push flow | Pipeline Triggers and Automation | 5 | Done |
| D-13 | Frontend automated tests/lint/coverage gates | Test Automation (UAT, E2E, Load) | 5 | Done |
| D-14 | Build failures block promotion path | Quality Approval Workflows | 3 | Done |
| D-15 | Frontend build + deployment reusable flow (Vercel) | Frontend Pipeline | 5 | Done |
| D-16 | Backend Jest/integration/security/lint workflow foundations | Backend Pipeline | 8 | Done |
| D-17 | Parallelized job design in orchestrators | Pipeline Performance Optimization | 5 | Done |
| D-18 | Mobile unit test + Gradle + Detox workflow foundations | Mobile Pipeline | 8 | Done |
| D-19 | Version-tag-driven release support | Pipeline Triggers and Automation | 5 | Done |
| D-20 | Backend Docker build pipeline foundations | Docker Build and Registry | 5 | Done |
| D-21 | Image tagging strategy (SHA/version stream) | Docker Build and Registry | 3 | Done |
| D-22 | Push images to GHCR | Docker Build and Registry | 3 | Done |
| D-23 | Container vulnerability scanning integrated | Security Rules and Quality Gates | 5 | Done |
| D-24 | Frontend Vercel deployment pipeline baseline | Frontend Pipeline | 3 | Done |
| D-25 | Build logs available in GitHub Actions | Pipeline Reporting | 2 | Done |
| D-26 | Preview deployment support (where configured) | Frontend Pipeline | 3 | Done |
| D-27 | Mobile Gradle build automation baseline | Mobile Pipeline | 5 | Done |
| D-28 | Detox E2E on emulator baseline | Test Automation (UAT, E2E, Load) | 5 | Done |
| D-29 | Production readiness gate workflow baseline | Production Readiness Gate | 5 | Done |
| D-30 | Audit log generation baseline | Audit Logging & Compliance | 3 | Done |
| D-31 | Pipeline notification workflow baseline (Slack/Discord) | Pipeline Notifications | 3 | Done |

## 2) Stories Not Done Yet

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| N-01 | Centralized API/middleware discovery across tribes | API Center & Routing | 5 | In Progress |
| N-02 | Clear developer onboarding for branching/docking/middleware flow | Developer Onboarding | 3 | In Progress |
| N-03 | Permission sync automation by tribe assignment | Identity & Access Management | 5 | In Progress |
| N-04 | Create back-end project template standardization | Backend Pipeline | 5 | In Progress |
| N-05 | Include/standardize folder structures across all tribe repos | Repository Templates | 5 | In Progress |
| N-06 | One-click project initialization from templates | Repository Templates | 8 | In Progress |
| N-07 | Enforce PR approval policy (2 approvals) across all repos | Quality Approval Workflows | 3 | In Progress |
| N-08 | API key security and DB consistency integration baseline | DB Integration and Security | 5 | In Progress |
| N-09 | Centralized workflow secret management hardening | Security Rules and Quality Gates | 5 | In Progress |
| N-10 | API contract testing standard | Test Automation (UAT, E2E, Load) | 5 | In Progress |
| N-11 | iOS artifact/release path completion | Mobile Pipeline | 8 | In Progress |
| N-12 | Unified automated test reporting across streams | Test Reporting and Analytics | 5 | In Progress |
| N-13 | Pipeline duration/cost analytics | Pipeline Performance Optimization | 3 | In Progress |
| N-14 | SonarCloud integration for FE/BE/mobile across all repos | SonarCloud Integration | 8 | In Progress |
| N-15 | SonarCloud PR comment feedback standard | SonarCloud Integration | 3 | Not Started |
| N-16 | Quality gate visibility and enforcement consistency | Quality Approval Workflows | 5 | In Progress |
| N-17 | Security rule/hotspot enforcement consistency | Security Rules and Quality Gates | 5 | In Progress |
| N-18 | Automated code smell/complexity/duplication reporting adoption | SonarCloud Integration | 5 | In Progress |
| N-19 | Quality gate approval workflow policy | Quality Approval Workflows | 3 | Not Started |
| N-20 | Pass/fail threshold standardization across all tribes | Quality Approval Workflows | 5 | In Progress |
| N-21 | Deployment URL comment consistency per repo | Deployment Dashboards | 3 | In Progress |
| N-22 | Signed production artifact process | Release Management | 8 | In Progress |
| N-23 | Flaky-test detection and screenshot/report enrichment | Test Reporting and Analytics | 5 | In Progress |
| N-24 | Staging environment parity with production | Staging Deployment Standards | 8 | In Progress |
| N-25 | Auto-deploy policy from protected branches per repo type | Staging Deployment Standards | 5 | In Progress |
| N-26 | Staging URL documentation consistency | Staging Deployment Standards | 3 | In Progress |
| N-27 | FE/BE/mobile packaging and distribution standard for pre-prod | Staging Deployment Standards | 5 | In Progress |
| N-28 | APK upload to GitHub Releases standardization | Mobile Release Publish | 5 | Not Started |
| N-29 | Automated release notes generation | Release Management | 5 | Not Started |
| N-30 | Health checks/log access for staging deployments | Staging Deployment Standards | 5 | In Progress |
| N-31 | UAT + E2E automation in staging | Test Automation (UAT, E2E, Load) | 8 | In Progress |
| N-32 | Selenium for critical flows full rollout | Test Automation (UAT, E2E, Load) | 5 | In Progress |
| N-33 | Nightly UAT schedule standard | Test Automation (UAT, E2E, Load) | 3 | Not Started |
| N-34 | Test reports/screenshots consistency | Test Reporting and Analytics | 3 | In Progress |
| N-35 | Grafana k6 load testing integration full rollout | Load Testing (Grafana k6) | 5 | In Progress |
| N-36 | Performance threshold gates before production full calibration | Load Testing (Grafana k6) | 5 | In Progress |
| N-37 | Consolidated cross-repo QA dashboard/reporting | Test Reporting and Analytics | 8 | Not Started |
| N-38 | Sign-off documentation/checklist standardization | Production Readiness Gate | 3 | In Progress |
| N-39 | Immutable approval history design | Audit Logging & Compliance | 5 | Not Started |
| N-40 | Rollback procedure and one-click rollback maturity | Staging Rollback Procedures | 8 | In Progress |
| N-41 | Rollback documentation per tribe | Staging Rollback Procedures | 3 | In Progress |
| N-42 | Rich error-detail and routing per tribe | Pipeline Notifications | 5 | In Progress |
| N-43 | Approval reminder/notification flows | Pipeline Notifications | 3 | In Progress |
| N-44 | Deployment dashboard across all tribes/repos | Deployment Dashboards | 8 | Not Started |
| N-45 | Staging uptime/error monitoring dashboard and alerts | Deployment Dashboards | 8 | Not Started |
| N-46 | API naming convention standard (tribe-owned/shared) | API Center & Routing | 3 | Not Started |
| N-47 | Gateway routing policy (tribe, shared, cross-tribe) | API Center & Routing | 5 | Not Started |
| N-48 | API registry/service catalog | API Center & Routing | 8 | Not Started |
| N-49 | API registry search/discovery | API Center & Routing | 5 | Not Started |
| N-50 | CI/CD automation for API registration | API Center & Routing | 5 | Not Started |

## 3) Stories Not Added Before, But Already Done //can be put into Stories Done already

These are items that were finished before being explicitly captured as stories.

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| BA-01 | As a DevOps Engineer, I want standardized workflow timeouts so that stuck CI jobs fail fast and do not block runner queues. | Pipeline Performance Optimization | 3 | Done |
| BA-02 | As a Security Engineer, I want explicit least-privilege workflow permissions so that pipelines only receive access required for execution. | Security Rules and Quality Gates | 5 | Done |
| BA-03 | As a Front-End Lead, I want a frontend standards check (Next.js + strict TypeScript) so that all tribe web repos follow baseline architecture and quality rules. | Frontend Pipeline | 5 | Done |
| BA-04 | As a Mobile Developer, I want package-manager-aware installs (npm, yarn, pnpm) so that CI runs reliably across different repository setups. | Mobile Pipeline | 3 | Done |
| BA-05 | As a Mobile Architect, I want stack-aware orchestration (React Native/Expo vs Kotlin) so that each system follows the correct build and test path automatically. | Mobile Dev Environment | 8 | Done |
| BA-06 | As a Security and Compliance Officer, I want production-gate audit logs generated in CI so that release approvals are traceable for governance. | Audit Logging & Compliance | 3 | Done |
| BA-07 | As a Platform Admin, I want reusable FE and mobile caller templates (single and multi mode) so that tribe onboarding to central CI/CD is faster and consistent. | Repository Templates | 8 | Done |
| BA-08 | As a DevOps Engineer, I want notification workflows with channel support so that tribes receive pipeline status updates consistently. | Pipeline Notifications | 3 | Done |
| BA-09 | As a Release Manager, I want promotion PR automation between protected branches so that environment transitions are controlled and repeatable. | Production Readiness Gate | 5 | Done |
| BA-10 | As a Platform Admin, I want stream-based version tagging so that release artifacts are traceable by system and stream. | Pipeline Triggers and Automation | 3 | Done |

### 3.1) Additional Done Stories Added Now (Not in Prior Tracker List) //can be added to Stories Done already

These are also completed implementations found in central workflows/templates and added now as explicit stories.

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| BA-11 | As a Security Engineer, I want a reusable security scan workflow so that all tribe pipelines can run standardized vulnerability checks. | Security Rules and Quality Gates | 5 | Done | asfjnjanokaf
| BA-12 | As a Quality Lead, I want a reusable SonarCloud scan workflow so that static analysis and quality-gate checks are enforced consistently. | SonarCloud Integration | 5 | Done |
| BA-13 | As a Platform Engineer, I want reusable lint/style checks so that code quality rules are enforced uniformly across repos. | Quality Approval Workflows | 3 | Done |
| BA-14 | As a Platform Engineer, I want reusable governance checks for web/mobile repositories so that baseline repo standards are validated early. | Repository Governance | 3 | Done |
| BA-15 | As a Platform Admin, I want workflow/template contract validation so that caller templates remain compatible with reusable workflows. | Repository Templates | 5 | Done |
| BA-16 | As a Delivery Manager, I want a reusable pipeline summary workflow so that stakeholders can quickly read final CI/CD outcomes. | Test Reporting and Analytics | 3 | Done |
| BA-17 | As a DevOps Engineer, I want a reusable deploy-to-environment workflow so that test, UAT, and production deployments follow one standard process. | Staging Deployment Standards | 5 | Done |
| BA-18 | As a Mobile Engineer, I want a reusable iOS build workflow so that iOS artifacts can be generated consistently in CI. | Mobile Pipeline | 5 | Done |
| BA-19 | As a Mobile QA Engineer, I want a reusable Detox iOS E2E workflow so that iOS regression coverage is automated in CI. | Test Automation (UAT, E2E, Load) | 5 | Done |
| BA-20 | As a Platform Engineer, I want a reusable Replit deploy workflow so that applicable projects can deploy with standardized automation. | Deployment Dashboards | 3 | Done |

## 4) Stories Not Yet Added, And Still Not Done //add to Stories not Done yet

These exist in the tracker as missing stories to add, but delivery is pending.

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| M-01 | As a Platform Admin, I want each tribe provisioned as a tenant so that users, roles, and access boundaries are isolated by tribe. | Identity & Access Management | 8 | Not Started |
| M-02 | As a Tribe Lead, I want tenant-scoped role templates (lead/dev/qa) so that access setup is consistent and fast. | Identity & Access Management | 5 | Not Started |
| M-03 | As a Security and Compliance Officer, I want MFA enforced for privileged roles so that account compromise risk is reduced. | Security Rules and Quality Gates | 5 | Not Started |
| M-04 | As a Platform Admin, I want automatic deprovisioning when members leave a tribe so that stale access is removed quickly. | Identity & Access Management | 5 | Not Started |
| M-05 | As a DevOps Engineer, I want CI to validate Descope issuer, audience, and scope before deploy so that only valid auth configuration is promoted. | Pipeline Triggers and Automation | 5 | Not Started |
| M-06 | As a Platform Admin, I want environment-specific secrets rotation checks so that expired credentials do not break deployments. | GitHub Actions Workflow Template | 5 | Not Started |
| M-07 | As a DevOps Engineer, I want a runner policy (hosted vs self-hosted per workload) so that cost and security are balanced. | Pipeline Performance Optimization | 3 | Not Started |
| M-08 | As a Security Engineer, I want high-risk jobs to run only on approved runners so that sensitive workloads are controlled. | Security Rules and Quality Gates | 5 | Not Started |
| M-09 | As a Tribe Lead, I want required checks standardized across all repos so that quality gates are consistent. | Quality Approval Workflows | 5 | Not Started |
| M-10 | As a Developer, I want reusable rollback playbooks linked in failed runs so that incident recovery is faster. | Staging Rollback Procedures | 3 | Not Started |
| M-11 | As a Platform Admin, I want a SonarCloud policy matrix by repo type so that required rules are clear for FE, BE, and mobile. | SonarCloud Integration | 5 | Not Started |
| M-12 | As a Tech Lead, I want PR decoration and quality-gate status mandatory on protected branches so that risky merges are blocked. | SonarCloud Integration | 5 | Not Started |
| M-13 | As a Security and Compliance Officer, I want security hotspot triage SLAs so that vulnerabilities are resolved within target windows. | Security Rules and Quality Gates | 3 | Not Started |
| M-14 | As a DevOps Engineer, I want a SonarCloud Free vs Pro decision record so that budget and feature trade-offs are documented. | SonarCloud Integration | 3 | Not Started |
| M-15 | As a Platform Admin, I want repository visibility classification (private/internal/public) so that each project matches data sensitivity requirements. | Identity & Access Management | 3 | Not Started |
| M-16 | As a Security and Compliance Officer, I want policy-as-code checks for prohibited public repos so that accidental exposure is prevented. | Security Rules and Quality Gates | 5 | Not Started |
| M-17 | As a Back-End Developer, I want API and data classification tags in CI so that protected services enforce stricter controls. | DB Integration and Security | 3 | Not Started |
| M-18 | As a QA Lead, I want Selenium Grid execution profiles (Chrome, Firefox, Edge) so that browser compatibility is verified systematically. | Test Automation (UAT, E2E, Load) | 5 | Not Started |
| M-19 | As a Performance Engineer, I want Grafana k6 integrated into pre-production gates so that regressions are caught before production. | Load Testing (Grafana k6) | 5 | Not Started |
| M-20 | As a Product Manager, I want a consolidated release-readiness report so that go/no-go decisions are faster and evidence-based. | Test Reporting and Analytics | 5 | Not Started |
| M-21 | As a Platform Admin, I want tribe-level DORA-style metrics dashboards so that delivery and reliability trends are visible. | Deployment Dashboards | 8 | Not Started |

## 5) Refactor / Standardization Stories //add to Stories Done

This section tracks architecture cleanup, standardization, and reusable-pipeline refactors.

| ID | Refactor Story | Epic | Points | Status |
|---|---|---|---:|---|
| R-01 | Reusable GitHub Actions workflow framework | GitHub Actions Workflow Template | 8 | Done |
| R-02 | Include pipeline configs in templates/workflows | Repository Templates | 3 | Done |
| R-03 | Frontend build + deployment reusable flow (Vercel) | Frontend Pipeline | 5 | Done |
| R-04 | Parallelized job design in orchestrators | Pipeline Performance Optimization | 5 | Done |
| R-05 | Build failures block promotion path | Quality Approval Workflows | 3 | Done |
| R-06 | Reusable FE and mobile caller templates (single + multi) | Repository Templates | 5 | Done |
| R-07 | Stack-aware mobile orchestration (Expo vs Kotlin) | Mobile Dev Environment | 8 | Done |
| R-08 | Standardized workflow timeouts | Pipeline Performance Optimization | 3 | Done |
| R-09 | Explicit least-privilege workflow permissions | Security Rules and Quality Gates | 5 | Done |
| R-10 | Backend project template standardization | Backend Pipeline | 5 | In Progress |
| R-11 | Folder structure standardization across tribe repos | Repository Templates | 5 | In Progress |
| R-12 | Pass/fail threshold standardization across tribes | Quality Approval Workflows | 5 | In Progress |
| R-13 | Sign-off documentation/checklist standardization | Production Readiness Gate | 3 | In Progress |

## 6) Totals

- Done stories: 31
- Not done stories (in-progress + not-started): 50
- Done-before-added stories: 20
- Missing-and-not-done stories: 21
- Refactor stories tracked: 13

## 7) Notes

- Point values are planning estimates to normalize backlog planning across tribes.
- Existing status source of truth remains USER_STORIES_STATUS.md; this file is a planning/reporting view.
