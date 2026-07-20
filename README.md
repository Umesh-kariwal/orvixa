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

### ADR-003: Relational Persistence Strategy & $0 Cost Infrastructure Policy

- **Status**: Decided
- **Context / Problem**: Selecting the primary persistence strategy for transactional student data, assessment attempt histories, diagnostic analytics, and multi-tenant metadata while adhering to a strict **$0 current infrastructure budget**.
- **Available Options**:
  1. **Local / Serverless PostgreSQL / SQLite (Zero Cost - Current Baseline)**: Run local PostgreSQL or file-backed SQLite in development/testing without incurring cloud instance charges.
  2. **Managed Cloud SQL (PostgreSQL)**: Fully managed cloud database instance.
- **Selected Option**: **Relational Abstraction (PostgreSQL-compatible) with $0 Initial Infrastructure**.
- **Why Selected**: Ensures zero monthly hosting cost during early development phases while maintaining full SQL/ACID compatibility. Cloud SQL is preserved as a future production scaling option when user traffic justifies managed cloud infrastructure.
- **Why Alternatives Were Rejected**: Permanently coupling early development to paid cloud services (e.g. minimum Cloud SQL instances) introduces unnecessary fixed costs before product-market fit.

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

### ADR-005: Provider-Agnostic AI Layer & Dependency Inversion Strategy

- **Status**: Decided
- **Context / Problem**: Directly coupling application code to vendor-specific LLM SDKs (e.g., Google Gemini, OpenAI) creates tight coupling, vendor lock-in, testing friction, and architectural fragility.
- **Available Options**:
  1. **Direct SDK Coupling**: Importing vendor SDKs directly into feature controllers/services.
  2. **Provider-Agnostic Abstraction Layer**: Defining abstract ports (`BaseLLMProvider`), standardized request/response models (`AIRequest`, `AIResponse`), a `ProviderRegistry`, and file-based `PromptLoader`.
- **Selected Option**: **Provider-Agnostic Abstraction Layer**.
- **Why Selected**: Strictly adheres to the Dependency Inversion Principle (DIP) and Clean Architecture. Application logic depends exclusively on abstract contracts, making LLM providers pluggable adapters without modifying core application code.
- **Why Alternatives Were Rejected**: Direct SDK coupling leaks provider-specific parameter structures throughout the codebase, making LLM migrations complex and risky.

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
- [x] **Phase 4: Backend Foundation** *(Completed)*
  - FastAPI application structure (`backend/app/main.py`)
  - Pydantic Settings configuration contract (`backend/app/core/config.py`)
  - Structured JSON logging setup (`backend/app/core/logging.py`)
  - Global exception handlers for HTTP, Validation & 500 Server Errors (`backend/app/core/errors.py`)
  - API v1 router namespace and health endpoint controller (`GET /api/v1/health`)
  - Dependency injection structure (`backend/app/api/deps.py`)
  - Application lifespan context manager and CORS middleware
- [x] **Phase 5: AI Core Architecture** *(Completed)*
  - Abstract provider interface `BaseLLMProvider` (`backend/app/core/ai/interfaces.py`)
  - Provider-agnostic request/response and streaming chunk models (`backend/app/core/ai/models.py`)
  - Token consumption tracking schemas (`TokenUsage`)
  - Dynamic provider registry architecture (`backend/app/core/ai/registry.py`)
  - File-based prompt loader & template storage conventions (`backend/app/core/ai/prompts.py`)
  - Granular AI exception hierarchy (`backend/app/core/ai/exceptions.py`)
  - Architecture Decision Record (ADR-005)
- [x] **Phase 6: Domain Modeling Foundation** *(Completed)*
  - Ubiquitous language definition for Orvixa Learning Copilot
  - Pure domain value objects (`PedagogicalAction`, `DifficultyLevel`, `ConceptId`, `StudentAnswer`)
  - Core domain entities (`AttemptContext`, `DiagnosticInsight`)
  - Abstract domain repository ports (`AssessmentRepository`, `DiagnosticRepository`)
  - Pure domain business exception hierarchy (`DomainException`, `InvalidAttemptStateException`)
  - Zero framework coupling (100% Python standard library, zero Pydantic/FastAPI/SQLAlchemy)
- [x] **Phase 7: Application Layer Foundation** *(Completed)*
  - Base use case contract (`BaseUseCase[InputDTO, OutputDTO]`)
  - Command & Query DTOs (`DiagnoseAttemptCommand`, `DiagnosticResultDTO`)
  - Application orchestration ports (`AIEnginePort`)
  - DTO-to-Domain mapping strategy (`AttemptMapper`)
  - Application exception hierarchy (`ApplicationException`, `UseCaseExecutionException`)
  - Strict separation of orchestration from domain business rules
- [ ] **Phase 8: Pedagogical Engine & Concrete Service Adapters** *(Pending)*
- [ ] **Phase 9: API & Integration Interfaces** *(Pending)*
- [ ] **Phase 10: Real-time Streaming & WebSocket Infrastructure** *(Pending)*
- [ ] **Phase 11: Deployment, Observability & CI/CD** *(Pending)*

---

## 🚀 Local Development Setup

### Frontend (React + Vite)
```bash
# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production (type-check & bundle)
npm run build

# 4. Run static linter
npx oxlint
```

### Backend (FastAPI)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Start FastAPI server with live reload
uvicorn app.main:app --reload --port 8000
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
