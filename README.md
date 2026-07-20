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
- **Future Impact**: Folder responsibilities will be enforced strictly using modular domain boundaries (e.g., `apps/`, `packages/`, `docs/`) to prevent code coupling.

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
- [ ] **Phase 3: Core Domain Models & Architecture Baseline** *(Pending)*
- [ ] **Phase 4: Pedagogical Engine & Service Layer** *(Pending)*
- [ ] **Phase 5: API & Integration Interfaces** *(Pending)*
- [ ] **Phase 6: Real-time Streaming & WebSocket Infrastructure** *(Pending)*
- [ ] **Phase 7: Deployment, Observability & CI/CD** *(Pending)*

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
