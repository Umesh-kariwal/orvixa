# Orvixa: Cloud-Native AI Learning Copilot

> Orvixa is an intelligent, cloud-native learning copilot designed to embed inside online learning platforms (e.g., MockPreps, Testbook, Oliveboard, Government Exam platforms, LMS, coaching platforms). Unlike simple conversational chatbots, Orvixa acts as an active, pedagogical AI teacher that understands student progress, diagnoses conceptual gaps, adapts to exam patterns, and provides structured guidance.

---

## 🎯 Vision & Mission

Orvixa is built from first principles as a production-grade, enterprise-ready SaaS product.

- **Pedagogical AI**: Goes beyond static prompt-response loops to provide interactive problem-solving, hints, error diagnosis, and personalized learning pathways.
- **Platform Agnostic**: Designed to integrate smoothly into any existing EdTech web application or LMS via clean, secure interfaces.
- **Production Mindset**: Zero tolerance for technical debt, placeholder code, or unverified architecture. Engineered for high performance, fault tolerance, and security.

---

## 🏛️ Architecture Decision Records (ADRs)

### ADR-001: Monorepo vs Multi-repo Repository Architecture

- **Status**: Decided
- **Context / Problem**: We need to choose the foundational repository structure for Orvixa. Orvixa will eventually comprise a core AI reasoning backend, platform integration SDKs/APIs, and embedded widget interfaces. We must decide whether to manage these components in a single monorepo or split them into multiple repositories.

- **Available Options**:
  1. **Multi-Repo**: Separate Git repositories for core engine, backend APIs, SDKs, and documentation.
  2. **Monorepo**: A single unified Git repository containing all components, shared packages, and documentation with strict boundaries.

- **Trade-off Analysis**:
  | Criteria | Multi-Repo | Monorepo (Selected) |
  | :--- | :--- | :--- |
  | **Developer Velocity** | Low for early-stage startup (cross-repo PR overhead) | High (single context, unified tooling) |
  | **Dependency Management** | Prone to version mismatch across components | Atomic updates & shared standards |
  | **CI/CD Complexity** | Requires complex multi-repo pipelines | Straightforward path-based triggering |
  | **Architectural Visibility** | Fragmented across repositories | Single source of truth |

- **Selected Option**: **Monorepo Strategy**.
- **Why Selected**: For a lean, founding team scaling a cloud-native SaaS product from scratch, a monorepo eliminates coordination friction, simplifies refactoring, keeps documentation synchronized with implementation, and ensures atomic commits across system boundaries.
- **Why Alternatives Were Rejected**: Multi-repo introduces artificial organizational friction, fragmented issue tracking, and synchronization overhead at an early stage where architectural agility is crucial.
- **Future Impact**: Folder responsibilities will be enforced strictly using modular domain boundaries to prevent code coupling.

---

### ADR-002: FastAPI vs Node.js for Core AI Reasoning Backend

- **Status**: Decided
- **Context / Problem**: Orvixa requires a high-performance backend framework to orchestrate AI reasoning pipelines, interface with LLMs (Google Gemini), process student analytics, and manage WebSocket streams.
- **Available Options**:
  1. **FastAPI (Python)**: Modern, asynchronous Python web framework built on Starlette & Pydantic.
  2. **Node.js (TypeScript / Express / NestJS)**: Event-driven JavaScript runtime environment.
- **Selected Option**: **FastAPI (Python)**.
- **Why Selected**: Native integration with the Python AI ecosystem (Google AI SDK, LangChain, LlamaIndex, NumPy, PyTorch), built-in async/await performance, auto-generated OpenAPI documentation, and strict runtime type validation with Pydantic.
- **Why Alternatives Were Rejected**: Node.js requires external wrappers or subprocess bridges for advanced LLM/ML data processing pipelines.

---

### ADR-003: Cloud SQL (PostgreSQL) vs Firestore for Primary Relational Data

- **Status**: Decided
- **Context / Problem**: Selecting the primary persistence engine for transactional student data, assessment attempt histories, diagnostic analytics, and multi-tenant metadata.
- **Available Options**:
  1. **Cloud SQL (PostgreSQL)**: Fully managed relational database engine.
  2. **Firebase Firestore**: Serverless NoSQL document database.
- **Selected Option**: **Cloud SQL (PostgreSQL)**.
- **Why Selected**: Guarantees ACID compliance for financial/attempt transactions, supports rich JSONB queries for semi-structured payloads, offers `pgvector` for future vector search/RAG indexing, and enforces relational integrity.
- **Why Alternatives Were Rejected**: Firestore lacks native join capabilities, multi-document ACID guarantees, and complex diagnostic analytics querying required for pedagogical insights.

---

### ADR-004: Firebase Hosting + Cloud Run Deployment Topology

- **Status**: Decided
- **Context / Problem**: Determining the serverless hosting topology for Orvixa's static frontend SPA and dynamic backend compute services.
- **Available Options**:
  1. **Firebase Hosting (Frontend) + GCP Cloud Run (Backend)**: Global CDN for React static assets combined with auto-scaling containerized microservices for FastAPI.
  2. **Monolithic Compute Virtual Machine (Compute Engine / EC2)**: Single VM instance running all frontend and backend processes.
- **Selected Option**: **Firebase Hosting + Cloud Run**.
- **Why Selected**: Zero maintenance overhead, sub-second global static asset distribution via Firebase CDN, and pay-per-use scaling to zero on Cloud Run, ensuring minimal infrastructure costs while guaranteeing high availability during traffic spikes.
- **Why Alternatives Were Rejected**: Monolithic VMs require manual OS patching, manual auto-scaling group management, and fixed hourly costs regardless of traffic.

---

## ☁️ Cloud Platform Architecture & Environment Strategy

```
                          [ Client Request ]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Firebase Hosting CDN ]       [ GCP Cloud Run (FastAPI) ]
       - Global Static Edge           - Containerized AI Engine
       - SPA Route Rewrites           - Serverless Auto-Scaling
                                                  │
                                  ┌───────────────┴───────────────┐
                                  ▼                               ▼
                        [ Cloud SQL (Postgres) ]       [ Google AI Gemini API ]
                        - Transactional DB             - Pedagogical LLM Core
```

### Environment Isolation Strategy
- **Development (`orvixa-dev`)**: Local execution using `.env.local` pointing to local/sandbox GCP services.
- **Staging (`orvixa-staging`)**: Pre-release verification triggered automatically via GitHub Actions CI/CD on pull requests.
- **Production (`orvixa-prod`)**: Live customer environment managed via strictly audited release workflows.

### Secrets Management Strategy
- **Zero Raw Credentials in Git**: All sensitive credentials (DB passwords, API keys, JWT secrets) are excluded via `.gitignore`.
- **GCP Secret Manager**: Server-side secrets are bound directly to Cloud Run service environment variables at deployment time.
- **Client Configuration**: Firebase web configuration variables are injected at build time via GitHub Secrets.

---

## 📐 Engineering Principles & Quality Gates

1. **Quality over Quantity**: Write clean, readable code over clever or obfuscated code.
2. **SOLID Principles & Clean Architecture**: Enforce single responsibility for every module, file, and function.
3. **No Dead Code / No Placeholders**: Every line in the repository must serve an active, production purpose. No `TODO`, `FIXME`, or dummy code.
4. **Security First**: Absolute protection against credential leakage, parameter tampering, and unvalidated inputs.
5. **Strict Scope Control**: Implement only what is explicitly defined for the active development phase.

---

## 📚 Software Engineering Concepts & Real-World Usage

| Subject | Real-World Application in Orvixa |
| :--- | :--- |
| **Python** | High-performance asynchronous AI service orchestrator and engine processing pipelines. |
| **Object-Oriented Programming (OOP)** | Domain-driven entities, encapsulate learning states, strategy patterns for pedagogical feedback models. |
| **DBMS & SQL** | Relational schemas for transactional persistence (users, attempt histories, analytics) with strict ACID guarantees. |
| **File Handling** | Secure streaming log management, local file caches, and artifact serialization. |
| **Data Structures & Algorithms (DSA)** | Directed Acyclic Graphs (DAGs) for learning pathways, priority queues for diagnostic scheduling, vector indices for retrieval. |
| **System Design** | Distributed microservices / modular monolith, event-driven streaming, rate limiting, and fault isolation. |
| **Computer Networks** | WebSockets for real-time bi-directional streaming, HTTP/2 REST endpoints, TLS encryption in transit. |
| **Operating Systems** | Non-blocking asynchronous I/O, event loops, process management, memory optimization under load. |
| **Cloud Computing** | Containerized workloads, managed secrets, scalable object storage, auto-scaling compute groups. |
| **Git & Version Control** | Conventional commits, trunk-based feature workflows, clean history without temporary noise. |
| **Docker & Containerization** | Deterministic local & production environments isolating runtime dependencies. |
| **REST APIs & WebSockets** | Standardized JSON request/response contracts for asynchronous client-server interaction. |
| **Authentication & Authorization** | Stateless JWT/OAuth2 token validation, role-based access control (RBAC), tenant isolation. |
| **Caching** | Redis key-value caching for frequent query responses, session state, and rate-limiting counters. |
| **Logging & Telemetry** | Structured JSON logs with correlation IDs for trace tracking across microservices. |
| **CI/CD** | Automated linting, static analysis, unit testing, and zero-downtime deployment pipelines. |

---

## 🛠️ Repository Standards & Conventions

### Git Commit Style (Conventional Commits)
All commits in this repository follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:
- `feat`: A new user-facing feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, no code change
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Maintenance, build configurations, dependency updates

---

## 🗺️ Product Roadmap

- [x] **Phase 1: Project Foundation & Architecture Standards** *(Completed)*
  - Monorepo repository setup & git remote connection
  - Baseline git discipline (`.gitignore`, commit rules)
  - Core architectural documentation (ADR-001)
- [x] **Phase 2: Frontend Foundation & Application Shell** *(Completed)*
  - React + TypeScript + Vite setup with `@/*` path resolution
  - Theme architecture (CSS variables, ThemeContext, ThemeToggle)
  - Layout & App Shell (`AppShell`, `Header`, `Footer`, `Container`)
  - Environment configuration contract (`.env.example`, `env.ts`, `vite-env.d.ts`)
  - Router foundation (`react-router-dom` v7 integration)
  - Core UI primitive foundation (`Button`, `Card`, `Container`)
- [x] **Phase 3: Cloud Platform Foundation** *(Completed)*
  - Firebase Hosting setup (`firebase.json`, `.firebaserc` SPA target)
  - Multi-environment isolation strategy (`development`, `staging`, `production`)
  - GCP Secret Manager & GitHub Secrets configuration contract
  - GitHub Actions CI workflow pipeline (`.github/workflows/ci.yml`)
  - Architecture Decision Records (ADR-002, ADR-003, ADR-004)
- [ ] **Phase 4: Core Domain Models & Architecture Baseline** *(Pending)*
- [ ] **Phase 5: Pedagogical Engine & Service Layer** *(Pending)*
- [ ] **Phase 6: API & Integration Interfaces** *(Pending)*
- [ ] **Phase 7: Real-time Streaming & WebSocket Infrastructure** *(Pending)*
- [ ] **Phase 8: Deployment, Observability & CI/CD** *(Pending)*

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production (type-check & bundle)
npm run build

# 4. Run static linter
npx oxlint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
