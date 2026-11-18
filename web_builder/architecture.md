# Architecture Documentation

This document outlines the system architecture, component design, infrastructure integrations, and design patterns for the `web_builder` microservice.

---

## 1. System Overview

`web_builder` is an AI microservice node within the **easeinv** ecosystem. Its primary objective is powering an AI agent capable of building online store web platforms.

---

## 2. Infrastructure & Storage Architecture

External infrastructure dependencies run via Docker Compose (`docker-compose.yml`):

### S3 Object Storage (SeaweedFS)
- **Service:** SeaweedFS running in all-in-one server mode with S3 support (`weed server -s3`).
- **Container Name:** `easeinv_seaweedfs`
- **Ports:** `8333` (S3 API), `8888` (Filer/Web UI), `9333` (Master)
- **Volume:** `seaweedfs_data` mapped to `/data`
- **SDK:** `boto3`
- **Configuration Layer:** `src/config/s3.py` provides `S3Config` (implementing `S3ClientProvider` protocol) and client factory functions (`get_s3_config`, `get_s3_client`).
- **Settings:** Configured via `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION_NAME`, `S3_BUCKET_NAME` in `src/settings.py`.
- **Storage Layout:** Store artifacts are placed under `web_stores/store-<store_id>/draft/repository.zip`.

### Vector Database (Qdrant)
- **Service:** Qdrant vector database (`qdrant/qdrant:latest`).
- **Container Name:** `easeinv_qdrant`
- **Ports:** `6333` (HTTP REST API and Web UI), `6334` (gRPC API)
- **Volume:** `qdrant_data` mapped to `/qdrant/storage`
- **SDK:** `qdrant-client`
- **Configuration Layer:** `src/config/qdrant.py` provides `QdrantConfig` (implementing `QdrantClientProvider` protocol) and client factory functions (`get_qdrant_config`, `get_qdrant_client` returning `AsyncQdrantClient`).
- **Settings:** Configured via `QDRANT_HOST`, `QDRANT_PORT`, `QDRANT_GRPC_PORT`, `QDRANT_API_KEY`, `QDRANT_URL` in `src/settings.py`.

### Message Broker (RabbitMQ)
- **Service:** RabbitMQ AMQP broker running with management plugin (`rabbitmq:3-management`).
- **SDK:** `aio-pika` (asynchronous AMQP 0-9-1 client).
- **Configuration Layer:** `src/config/rabbitmq.py` provides `RabbitMQConfig` (implementing `RabbitMQConnectionProvider` protocol) and client factory functions (`get_rabbitmq_config`).
- **Settings:** Configured via `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, and `RABBITMQ_PASSWORD` (which automatically compute `RABBITMQ_CONNECTION_URI`), `WEB_BUILDER_JOB_QUEUE`, and `RABBITMQ_RETRY_DELAY_MS` in `src/settings.py`.

---

## 3. External API Integrations

### Exa Search & Content Retrieval
- **SDK:** `exa-py`
- **Configuration Layer:** `src/config/exa.py` provides `ExaConfig` (implementing `ExaClientProvider` protocol) and client factory functions (`get_exa_config`, `get_exa_client`).
- **Settings:** Configured via `EXA_API_KEY` in `src/settings.py`.

---

## 4. Messaging & Job Processing Architecture

The service processes asynchronous store building tasks via an event-driven RabbitMQ pipeline:

### Queue Triplet Pattern
Each logical queue asserts a 3-queue topology with dead-letter exchange (DLX) routing:
1. **Main Queue (`WEB_BUILDER_JOB_QUEUE`):**
   - Durable queue receiving incoming jobs from API clients or previous stages.
   - Configured with `x-dead-letter-exchange: ""` and `x-dead-letter-routing-key: <queue>_retry`.
2. **Retry Queue (`<queue>_retry`):**
   - Durable queue holding failed jobs for a delayed retry interval (`RABBITMQ_RETRY_DELAY_MS`).
   - Configured with message TTL (`x-message-ttl: RETRY_DELAY_MS`), `x-dead-letter-exchange: ""`, and `x-dead-letter-routing-key: <queue>` so expired messages automatically route back to the main queue.
3. **Dead-Letter Queue (`<queue>_dlq`):**
   - Durable terminal queue receiving unparseable messages, expired jobs, or jobs that have exceeded `max_retries`.

### Job Data Models (`src/schemas/job.py`)
- `JobType`: Enum defining supported jobs:
  - `WEB_BUILDER_STORE_INIT`: Initial creation and setup of the store codebase.
  - `WEB_BUILDER_STORE_DEVELOP`: Ongoing iterative feature development.
- `JobPayload`: DTO carrying user prompt and context.
- `Job`: Envelope DTO containing `job_id`, `store_id`, `type`, `retry_count`, `max_retries`, `expiry`, and `payload`.

### Job Manager (`src/services/job_manager.py`)
- Service entrypoint and consumer listening to `WEB_BUILDER_JOB_QUEUE`.
- Spawns worker execution asynchronously in the Python event loop (`asyncio.create_task`) without blocking consumer throughput.
- Enforces payload validation, expiration checks, and programmatic retry management before routing to the retry queue or DLQ.
- **Worker Map Resolution (`WORKER_MAP`):** Uses an extensible registry mapping `JobType` to `BaseJobWorker` classes (`dict[JobType, type[BaseJobWorker]]`). Workers are looked up by type and instantiated via dependency injection (`_instantiate_worker`), adhering to the Open/Closed Principle (OCP) without procedural branching.
- Integrated into FastAPI application lifecycle (`src/app.py`).

---

## 5. Command Execution & Worker Architecture

### Command Execution Abstraction (`src/services/command_execution.py`)
- `CommandExecutionManager`: Abstract Base Class defining sandboxed command execution over the workspace directory.
- `CommandExecutionResult`: DTO carrying `exit_code`, `stdout`, and `stderr`.
- Keeps workers decoupled from concrete local subprocess or containerized sandbox implementations.

### Workers (`src/workers/`)
- `BaseJobWorker`: Abstract interface requiring async `execute(job: Job) -> None`.
- `StoreInitWorker`: Worker orchestrating store initialization:
  1. Validates `STARTER_REPO_URL` from configuration.
  2. Ensures store workspace directory exists (`workspace/store-<store_id>`).
  3. Clones the repository using sparse clone (`git clone --depth 1 --filter=blob:none --sparse <STARTER_REPO_URL> easeinv`).
  4. Sparse checkouts the template directory (`git sparse-checkout set <STARTER_TEMPLATE_DIR>`).
  5. Moves the template directory outside `easeinv/` to `workspace/store-<store_id>/repository` and removes `easeinv/`.
  6. Checks for and removes any existing `.git` directory inside `repository/`, then initializes a clean git repository (`git init`, `git add -A`, and `git commit -m "Project initialized"` configured with `GIT_USER` from settings for both name and email).
  7. Cleans and purges all gitignored files and directories (`git clean -fdX`) prior to archiving.
  8. Packages the project directory into `repository.zip` via `CreateZipTool`.
  9. Uploads the zip archive to S3 object storage at `web_stores/store-<store_id>/draft/repository.zip`.

---

## 6. MCP (Model Context Protocol) Architecture

The service leverages FastMCP for tool discovery, registration, and invocation:

### FastMCP Server
- Implemented in `src/mcp/server.py` (`MCPServer` implementing `MCPServerProvider` protocol).
- Initialized with `MCP_SERVER_NAME` from `src/settings.py`.
- Registers tools using `src/mcp/registry.py`.

### FastMCP Client
- Implemented in `src/mcp/client.py` (`MCPClientManager` implementing `MCPClientProvider` protocol).
- Manages an async client session connected to the FastMCP server.
- Connected and disconnected through FastAPI application lifespan context (`src/app.py`), made available at `app.state.mcp_client`.

### Tool Registry & Tool Abstraction Layer
- **Tool Protocol / Base Class:** `src/tools/base.py` defines `BaseTool` abstract base class requiring `name`, `description`, and async `run(...)` execution.
- **Tool Enums:** `src/tools/enums.py` defines `ToolName` Enum identifying tools (`web_search`, `web_fetch`, `create_zip`).
- **Registry:** `src/mcp/registry.py` defines `TOOLS_MAP` mapping each `ToolName` to its tool implementation, tool lookup utilities, and `register_tools(...)` to expose tools via FastMCP.
- **Implementations:**
  - `src/tools/web_search.py`: `WebSearchTool` uses Exa API client to search the web.
  - `src/tools/web_fetch.py`: `WebFetchTool` uses Exa API client to fetch web page contents.
  - `src/tools/create_zip.py`: `CreateZipTool` compresses a directory tree into a zip archive.

---

## 7. Architectural Invariants & Patterns

- **Dependency Inversion:** High-level domain services depend on abstract protocols (`Protocol`) or ABCs, not concrete low-level SDK clients. Client providers and executors are injected via constructors.
- **Factory Pattern:** Client instances and configurations are instantiated through factory functions (`get_*_config`, `get_*_client`).
- **Unified Settings:** Centralized Pydantic settings in `src/settings.py` read from `.env` with fallback defaults.
- **Decoupled MCP Architecture:** Tools are defined independently of FastMCP server implementation and dynamically registered through the registry.
- **Asynchronous Execution:** Background jobs run concurrently as non-blocking tasks in the event loop.

---

## 8. Project Directory Structure

```
web_builder/
├── AGENTS.md                      # Agent and developer guidelines and engineering rules
├── CLAUDE.md                      # Symlink to AGENTS.md
├── GEMINI.md                      # Symlink to AGENTS.md
├── architecture.md                # System architecture and design documentation (this file)
├── README.md                      # Project documentation and setup guide
├── pyproject.toml                 # uv package configuration and dependencies
├── uv.lock                        # Locked dependency graph
├── .python-version                # Pinned Python version (3.12+)
├── .env.example                   # Environment variable template
├── docker-compose.yml             # Docker services (SeaweedFS, Qdrant)
├── main.py                        # Service entrypoint
├── src/
│   ├── app.py                     # FastAPI application instance and lifecycle
│   ├── settings.py                # Configuration and environment settings
│   ├── config/                    # Infrastructure and client connection configurations
│   │   ├── __init__.py            # Config module exports
│   │   ├── exa.py                 # Exa API configuration and async client provider
│   │   ├── qdrant.py              # Qdrant vector DB connection configuration and async client provider
│   │   ├── rabbitmq.py            # RabbitMQ connection configuration and queue declarations
│   │   └── s3.py                  # S3/SeaweedFS connection configuration and client provider
│   ├── mcp/                       # FastMCP server and client infrastructure
│   │   ├── __init__.py            # MCP module exports
│   │   ├── client.py              # MCP client manager and lifecycle connection provider
│   │   ├── registry.py            # Tool mapping, registry, and FastMCP registration
│   │   └── server.py              # FastMCP server provider and instance configuration
│   ├── schemas/                   # Data transfer objects and validation schemas
│   │   ├── __init__.py            # Schemas module exports
│   │   └── job.py                 # Job, JobType, and JobPayload DTOs
│   ├── services/                  # Business logic domain services (OOP classes)
│   │   ├── __init__.py            # Services module exports
│   │   ├── command_execution.py   # CommandExecutionManager ABC and execution results
│   │   └── job_manager.py         # JobManager RabbitMQ listener and worker dispatcher
│   ├── tools/                     # MCP tools and execution implementations
│   │   ├── __init__.py            # Tools module exports
│   │   ├── base.py                # BaseTool abstract base class
│   │   ├── create_zip.py          # CreateZipTool zip compression implementation
│   │   ├── enums.py               # ToolName Enum definition
│   │   ├── web_fetch.py           # Exa web content fetching tool implementation
│   │   └── web_search.py          # Exa web search tool implementation
│   ├── utils/                     # Shared utilities and logging
│   │   ├── __init__.py
│   │   └── logger.py              # Logging setup
│   └── workers/                   # Job workers implementing BaseJobWorker
│       ├── __init__.py            # Workers module exports
│       ├── base.py                # BaseJobWorker abstract base class
│       └── init_worker.py         # StoreInitWorker implementation
└── tests/                         # Unit and integration test suite
    ├── test_init_worker.py        # StoreInitWorker unit tests
    ├── test_job_manager.py        # JobManager unit tests
    ├── test_rabbitmq_config.py    # RabbitMQConfig unit tests
    ├── test_schemas.py            # Job schema validation tests
    └── test_tools.py              # Tool unit tests
```

---

## 9. Architecture Maintenance Policy

- `architecture.md` must be updated whenever any architectural change, structural modification, component addition, or design pattern change is made.
- Do not add dates to this document.
