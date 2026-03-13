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
| D-01 | As a Platform Admin, I want to create a GitHub organization for all tribes so that collaboration and governance are centralized. | Foundation: Repository & Access Strategy | 3 | Done |
| D-02 | As a Platform Admin, I want to configure tribe-based GitHub teams and access so that permissions are structured by ownership boundaries. | Foundation: Repository & Access Strategy | 5 | Done |
| D-03 | As a Platform Admin, I want to define and enforce repository governance and naming standards so that all repos are consistent and easier to manage. | Repository Governance | 5 | Done |
| D-04 | As a Platform Admin, I want to manage tribe permissions with protected access controls so that sensitive branches and resources stay secure. | Repository Governance | 5 | Done |
| D-05 | As a Platform Admin, I want developer push isolation by repository and tribe model so that cross-tribe change risk is reduced. | Repository Governance | 3 | Done |
| D-06 | As a DevOps Engineer, I want front-end CI/CD template and caller patterns so that frontend onboarding is fast and standardized. | Frontend Pipeline | 5 | Done |
| D-07 | As a Mobile Architect, I want mobile CI/CD template and caller patterns so that mobile teams can onboard with consistent automation. | Mobile Pipeline | 5 | Done |
| D-08 | As a Platform Engineer, I want pipeline configs included in templates and workflows so that repos start with production-ready CI/CD defaults. | Repository Templates | 3 | Done |
| D-09 | As a Platform Admin, I want branch protection enforced on protected branches so that direct risky changes are prevented. | Branch Governance & Protection | 3 | Done |
| D-10 | As a Mobile Architect, I want mobile repository support for React Native and Kotlin paths so that mixed-stack mobile repos are supported. | Mobile Dev Environment | 5 | Done |
| D-11 | As a DevOps Engineer, I want a reusable GitHub Actions workflow framework so that CI/CD logic is standardized across tribes. | GitHub Actions Workflow Template | 8 | Done |
| D-12 | As a DevOps Engineer, I want automatic workflow triggers on PR and push events so that validation runs consistently without manual steps. | Pipeline Triggers and Automation | 5 | Done |
| D-13 | As a QA Lead, I want frontend automated test, lint, and coverage gates so that low-quality changes are blocked early. | Test Automation (UAT, E2E, Load) | 5 | Done |
| D-14 | As a Release Manager, I want build failures to block promotion so that unstable artifacts cannot move to higher environments. | Quality Approval Workflows | 3 | Done |
| D-15 | As a Front-End Lead, I want a reusable frontend build and Vercel deploy flow so that deployments are predictable and repeatable. | Frontend Pipeline | 5 | Done |
| D-16 | As a Back-End Lead, I want backend Jest, integration, security, and lint workflow foundations so that backend quality checks are enforced by default. | Backend Pipeline | 8 | Done |
| D-17 | As a DevOps Engineer, I want parallelized job design in orchestrators so that pipelines complete faster and scale better. | Pipeline Performance Optimization | 5 | Done |
| D-18 | As a Mobile Lead, I want mobile unit test, Gradle, and Detox workflow foundations so that mobile quality and build checks are automated. | Mobile Pipeline | 8 | Done |
| D-19 | As a Release Manager, I want version-tag-driven releases so that artifact lineage is traceable and consistent. | Pipeline Triggers and Automation | 5 | Done |
| D-20 | As a DevOps Engineer, I want backend Docker build pipeline foundations so that backend services can be containerized consistently. | Docker Build and Registry | 5 | Done |
| D-21 | As a DevOps Engineer, I want an image tagging strategy using SHA and version streams so that container versions are traceable. | Docker Build and Registry | 3 | Done |
| D-22 | As a DevOps Engineer, I want images pushed to GHCR so that containers are stored in a centralized registry. | Docker Build and Registry | 3 | Done |
| D-23 | As a Security Engineer, I want container vulnerability scanning integrated so that insecure images are detected before release. | Security Rules and Quality Gates | 5 | Done |
| D-24 | As a Front-End Lead, I want a baseline frontend Vercel deployment pipeline so that web apps can be deployed consistently from CI. | Frontend Pipeline | 3 | Done |
| D-25 | As a Developer, I want build logs available in GitHub Actions so that troubleshooting failed runs is quick and clear. | Pipeline Reporting | 2 | Done |
| D-26 | As a Front-End Lead, I want preview deployment support where configured so that teams can validate changes before promotion. | Frontend Pipeline | 3 | Done |
| D-27 | As a Mobile Developer, I want baseline mobile Gradle build automation so that Android artifacts are built consistently in CI. | Mobile Pipeline | 5 | Done |
| D-28 | As a QA Engineer, I want a Detox E2E emulator baseline so that mobile regression coverage runs automatically. | Test Automation (UAT, E2E, Load) | 5 | Done |
| D-29 | As a Release Manager, I want a production readiness gate baseline so that only validated releases reach production. | Production Readiness Gate | 5 | Done |
| D-30 | As a Security and Compliance Officer, I want baseline audit log generation so that release and approval activities are traceable. | Audit Logging & Compliance | 3 | Done |
| D-31 | As a DevOps Engineer, I want baseline pipeline notifications for Slack and Discord so that teams receive timely status updates. | Pipeline Notifications | 3 | Done |
| BA-01 | As a DevOps Engineer, I want standardized workflow timeouts so that stuck CI jobs fail fast and do not block runner queues. | Pipeline Performance Optimization | 3 | Done |
| BA-02 | As a Security Engineer, I want explicit least-privilege workflow permissions so that pipelines only receive access required for execution. | Security Rules and Quality Gates | 5 | Done |
| BA-03 | As a Front-End Lead, I want a frontend standards check (Next.js + strict TypeScript) so that all tribe web repos follow baseline architecture and quality rules. | Frontend Pipeline | 5 | Done |
| BA-04 | As a Mobile Developer, I want package-manager-aware installs (npm, yarn, pnpm) so that CI runs reliably across different repository setups. | Mobile Pipeline | 3 | Done |
| BA-05 | As a Mobile Architect, I want stack-aware orchestration (React Native/Expo vs Kotlin) so that each system follows the correct build and test path automatically. | Mobile Dev Environment | 8 | Done |
| BA-06 | As a Security and Compliance Officer, I want production-gate audit logs generated in CI so that release approvals are traceable for governance. | Audit Logging & Compliance | 3 | Done |
| BA-07 | As a Platform Admin, I want reusable FE and mobile caller templates (single and multi mode) so that tribe onboarding to central CI/CD is faster and consistent. | Repository Templates | 5 | Done |
| BA-08 | As a DevOps Engineer, I want notification workflows with channel support so that tribes receive pipeline status updates consistently. | Pipeline Notifications | 3 | Done |
| BA-09 | As a Release Manager, I want promotion PR automation between protected branches so that environment transitions are controlled and repeatable. | Production Readiness Gate | 5 | Done |
| BA-10 | As a Platform Admin, I want stream-based version tagging so that release artifacts are traceable by system and stream. | Pipeline Triggers and Automation | 3 | Done |
| BA-11 | As a Security Engineer, I want a reusable security scan workflow so that all tribe pipelines can run standardized vulnerability checks. | Security Rules and Quality Gates | 5 | Done |
| BA-12 | As a Quality Lead, I want a reusable SonarCloud scan workflow so that static analysis and quality-gate checks are enforced consistently. | SonarCloud Integration | 5 | Done |
| BA-13 | As a Platform Engineer, I want reusable lint/style checks so that code quality rules are enforced uniformly across repos. | Quality Approval Workflows | 3 | Done |
| BA-14 | As a Platform Engineer, I want reusable governance checks for web/mobile repositories so that baseline repo standards are validated early. | Repository Governance | 3 | Done |
| BA-15 | As a Platform Admin, I want workflow/template contract validation so that caller templates remain compatible with reusable workflows. | Repository Templates | 5 | Done |
| BA-16 | As a Delivery Manager, I want a reusable pipeline summary workflow so that stakeholders can quickly read final CI/CD outcomes. | Test Reporting and Analytics | 3 | Done |
| BA-17 | As a DevOps Engineer, I want a reusable deploy-to-environment workflow so that test, UAT, and production deployments follow one standard process. | Staging Deployment Standards | 5 | Done |
| BA-18 | As a Mobile Engineer, I want a reusable iOS build workflow so that iOS artifacts can be generated consistently in CI. | Mobile Pipeline | 5 | Done |
| BA-19 | As a Mobile QA Engineer, I want a reusable Detox iOS E2E workflow so that iOS regression coverage is automated in CI. | Test Automation (UAT, E2E, Load) | 5 | Done |
| BA-20 | As a Platform Engineer, I want a reusable Replit deploy workflow so that applicable projects can deploy with standardized automation. | Deployment Dashboards | 3 | Done |

## 2) Stories Not Done Yet

| ID | Story | Epic | Points | Status |
|---|---|---|---:|---|
| N-01 | As a Platform Admin, I want centralized API and middleware discovery across tribes so that teams can find and reuse shared services faster. | API Center & Routing | 5 | In Progress |
| N-02 | As a New Developer, I want clear onboarding for branching, docking, and middleware flow so that I can contribute safely and quickly. | Developer Onboarding | 3 | In Progress |
| N-03 | As a Platform Admin, I want permission sync automated by tribe assignment so that access stays accurate without manual effort. | Identity & Access Management | 5 | In Progress |
| N-04 | As a Back-End Lead, I want standardized backend project templates so that new backend repos start with consistent structure and CI readiness. | Backend Pipeline | 5 | In Progress |
| N-05 | As a Platform Engineer, I want folder structures standardized across tribe repos so that navigation, tooling, and automation stay consistent. | Repository Templates | 5 | In Progress |
| N-06 | As a Platform Admin, I want one-click project initialization from templates so that team setup time is reduced. | Repository Templates | 8 | In Progress |
| N-07 | As a Platform Admin, I want PR approval policy enforcement (2 approvals) across all repos so that merge quality is consistent. | Quality Approval Workflows | 3 | In Progress |
| N-08 | As a Security Engineer, I want API key security and DB consistency baselines integrated so that backend risks are reduced. | DB Integration and Security | 5 | In Progress |
| N-09 | As a Security Engineer, I want hardened centralized workflow secret management so that secret exposure risk is minimized. | Security Rules and Quality Gates | 5 | In Progress |
| N-10 | As a QA Lead, I want an API contract testing standard so that interface regressions are detected early. | Test Automation (UAT, E2E, Load) | 5 | In Progress |
| N-11 | As a Mobile Release Engineer, I want iOS artifact and release path completion so that iOS delivery is fully automated. | Mobile Pipeline | 8 | In Progress |
| N-12 | As a QA Lead, I want unified automated test reporting across streams so that quality status is visible in one place. | Test Reporting and Analytics | 5 | In Progress |
| N-13 | As a DevOps Engineer, I want pipeline duration and cost analytics so that optimization decisions are data-driven. | Pipeline Performance Optimization | 3 | In Progress |
| N-14 | As a Platform Admin, I want SonarCloud integrated across FE, BE, and mobile repos so that quality checks are consistent. | SonarCloud Integration | 8 | In Progress |
| N-15 | As a Developer, I want SonarCloud PR comment feedback standardized so that code issues are visible directly during review. | SonarCloud Integration | 3 | Not Started |
| N-16 | As a Platform Admin, I want quality-gate visibility and enforcement consistency so that merge decisions are reliable. | Quality Approval Workflows | 5 | In Progress |
| N-17 | As a Security Engineer, I want security rule and hotspot enforcement consistency so that vulnerability handling is predictable. | Security Rules and Quality Gates | 5 | In Progress |
| N-18 | As a Tech Lead, I want automated reporting for code smell, complexity, and duplication so that refactoring priorities are clear. | SonarCloud Integration | 5 | In Progress |
| N-19 | As a Platform Admin, I want a quality-gate approval workflow policy so that approvals follow a clear governance model. | Quality Approval Workflows | 3 | Not Started |
| N-20 | As a Platform Admin, I want pass/fail thresholds standardized across tribes so that quality expectations are uniform. | Quality Approval Workflows | 5 | In Progress |
| N-21 | As a Release Manager, I want deployment URL comments consistent per repo so that reviewers can validate deploys quickly. | Deployment Dashboards | 3 | In Progress |
| N-22 | As a Release Manager, I want a signed production artifact process so that release integrity can be verified. | Release Management | 8 | In Progress |
| N-23 | As a QA Engineer, I want flaky-test detection with screenshot/report enrichment so that unstable tests are triaged faster. | Test Reporting and Analytics | 5 | In Progress |
| N-24 | As a Platform Admin, I want staging parity with production so that pre-production validation is realistic. | Staging Deployment Standards | 8 | In Progress |
| N-25 | As a DevOps Engineer, I want auto-deploy policy from protected branches by repo type so that release flow is controlled and repeatable. | Staging Deployment Standards | 5 | In Progress |
| N-26 | As a Developer, I want staging URL documentation standardized so that environment access is clear for every team. | Staging Deployment Standards | 3 | In Progress |
| N-27 | As a Release Manager, I want FE, BE, and mobile packaging/distribution standards for pre-prod so that handoffs are consistent. | Staging Deployment Standards | 5 | In Progress |
| N-28 | As a Mobile Release Engineer, I want APK upload to GitHub Releases standardized so that distribution is centralized and auditable. | Mobile Release Publish | 5 | Not Started |
| N-29 | As a Release Manager, I want automated release notes generation so that change communication is faster and more accurate. | Release Management | 5 | Not Started |
| N-30 | As an SRE, I want health checks and log access for staging deployments so that issues are detected and diagnosed quickly. | Staging Deployment Standards | 5 | In Progress |
| N-31 | As a QA Lead, I want UAT and E2E automation in staging so that regression risk is reduced before production promotion. | Test Automation (UAT, E2E, Load) | 8 | In Progress |
| N-32 | As a QA Lead, I want Selenium rollout for critical flows so that browser-level regression checks cover high-risk paths. | Test Automation (UAT, E2E, Load) | 5 | In Progress |
| N-33 | As a QA Lead, I want a nightly UAT schedule standard so that critical journeys are validated continuously. | Test Automation (UAT, E2E, Load) | 3 | Not Started |
| N-34 | As a QA Engineer, I want test reports and screenshots to follow a consistent format so that failures are easier to analyze. | Test Reporting and Analytics | 3 | In Progress |
| N-35 | As a Performance Engineer, I want Grafana k6 integration fully rolled out so that load testing becomes standard across teams. | Load Testing (Grafana k6) | 5 | In Progress |
| N-36 | As a Performance Engineer, I want performance threshold gates calibrated before production so that poor performance does not ship. | Load Testing (Grafana k6) | 5 | In Progress |
| N-37 | As a QA Lead, I want consolidated cross-repo QA dashboards and reporting so that quality posture is visible across tribes. | Test Reporting and Analytics | 8 | Not Started |
| N-38 | As a Release Manager, I want sign-off documentation and checklist standards so that release approvals are consistent and auditable. | Production Readiness Gate | 3 | In Progress |
| N-39 | As a Security and Compliance Officer, I want immutable approval history design so that release governance records cannot be tampered with. | Audit Logging & Compliance | 5 | Not Started |
| N-40 | As a DevOps Engineer, I want rollback procedure and one-click rollback maturity so that incidents can be mitigated quickly. | Staging Rollback Procedures | 8 | In Progress |
| N-41 | As a Tribe Lead, I want rollback documentation per tribe so that teams can execute recovery consistently. | Staging Rollback Procedures | 3 | In Progress |
| N-42 | As a DevOps Engineer, I want rich error details and routing per tribe so that alerts reach the right owners with actionable context. | Pipeline Notifications | 5 | In Progress |
| N-43 | As a Release Manager, I want approval reminder and notification flows so that release steps are not delayed by missed approvals. | Pipeline Notifications | 3 | In Progress |
| N-44 | As a Platform Admin, I want a deployment dashboard across all tribes and repos so that release visibility is centralized. | Deployment Dashboards | 8 | Not Started |
| N-45 | As an SRE, I want staging uptime/error monitoring dashboards and alerts so that reliability issues are surfaced early. | Deployment Dashboards | 8 | Not Started |
| N-46 | As an API Architect, I want API naming convention standards for tribe-owned and shared services so that APIs are consistent and discoverable. | API Center & Routing | 3 | Not Started |
| N-47 | As an API Architect, I want gateway routing policy for tribe, shared, and cross-tribe traffic so that service boundaries are enforced correctly. | API Center & Routing | 5 | Not Started |
| N-48 | As a Platform Admin, I want an API registry and service catalog so that teams can discover owned and shared APIs quickly. | API Center & Routing | 8 | Not Started |
| N-49 | As a Developer, I want API registry search and discovery so that integration setup time is reduced. | API Center & Routing | 5 | Not Started |
| N-50 | As a DevOps Engineer, I want CI/CD automation for API registration so that service catalogs stay up to date automatically. | API Center & Routing | 5 | Not Started |
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

## 3) Stories Not Added Before, But Already Done

Agent, put stories not added before but already done here, when i ask you to revise the user stories

## 4) Stories Not Yet Added, And Still Not Done

Agent, put stories not added before and not done here, when i ask you to revise the user stories

## 5) Refactor / Standardization Stories

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

- Done stories: 51
- Not done stories (in-progress + not-started): 71
- Done-before-added stories: 0
- Missing-and-not-done stories: 0
- Refactor stories tracked: 13

## 7) Notes

- Point values are planning estimates to normalize backlog planning across tribes.
- Existing status source of truth remains USER_STORIES_STATUS.md; this file is a planning/reporting view.
