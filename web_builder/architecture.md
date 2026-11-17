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

### Vector Database (Qdrant)
- **Service:** Qdrant vector database (`qdrant/qdrant:latest`).
- **Container Name:** `easeinv_qdrant`
- **Ports:** `6333` (HTTP REST API and Web UI), `6334` (gRPC API)
- **Volume:** `qdrant_data` mapped to `/qdrant/storage`
- **SDK:** `qdrant-client`
- **Configuration Layer:** `src/config/qdrant.py` provides `QdrantConfig` (implementing `QdrantClientProvider` protocol) and client factory functions (`get_qdrant_config`, `get_qdrant_client` returning `AsyncQdrantClient`).
- **Settings:** Configured via `QDRANT_HOST`, `QDRANT_PORT`, `QDRANT_GRPC_PORT`, `QDRANT_API_KEY`, `QDRANT_URL` in `src/settings.py`.

---

## 3. External API Integrations

### Exa Search & Content Retrieval
- **SDK:** `exa-py`
- **Configuration Layer:** `src/config/exa.py` provides `ExaConfig` (implementing `ExaClientProvider` protocol) and client factory functions (`get_exa_config`, `get_exa_client`).
- **Settings:** Configured via `EXA_API_KEY` in `src/settings.py`.

---

## 4. MCP (Model Context Protocol) Architecture

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
- **Tool Enums:** `src/tools/enums.py` defines `ToolName` Enum identifying tools (`web_search`, `web_fetch`).
- **Registry:** `src/mcp/registry.py` defines `TOOLS_MAP` mapping each `ToolName` to its tool implementation, tool lookup utilities, and `register_tools(...)` to expose tools via FastMCP.
- **Implementations:**
  - `src/tools/web_search.py`: `WebSearchTool` uses Exa API client to search the web.
  - `src/tools/web_fetch.py`: `WebFetchTool` uses Exa API client to fetch web page contents.

---

## 5. Architectural Invariants & Patterns

- **Dependency Inversion:** High-level domain services depend on abstract protocols (`Protocol`), not concrete low-level SDK clients. Client providers are injected via constructors.
- **Factory Pattern:** Client instances and configurations are instantiated through factory functions (`get_*_config`, `get_*_client`).
- **Unified Settings:** Centralized Pydantic settings in `src/settings.py` read from `.env` with fallback defaults.
- **Decoupled MCP Architecture:** Tools are defined independently of FastMCP server implementation and dynamically registered through the registry.

---

## 6. Project Directory Structure

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
└── src/
    ├── app.py                     # FastAPI application instance and lifecycle
    ├── settings.py                # Configuration and environment settings
    ├── config/                    # Infrastructure and client connection configurations
    │   ├── __init__.py            # Config module exports
    │   ├── exa.py                 # Exa API configuration and async client provider
    │   ├── qdrant.py              # Qdrant vector DB connection configuration and async client provider
    │   └── s3.py                  # S3/SeaweedFS connection configuration and client provider
    ├── mcp/                       # FastMCP server and client infrastructure
    │   ├── __init__.py            # MCP module exports
    │   ├── client.py              # MCP client manager and lifecycle connection provider
    │   ├── registry.py            # Tool mapping, registry, and FastMCP registration
    │   └── server.py              # FastMCP server provider and instance configuration
    ├── services/                  # Business logic domain services (OOP classes)
    ├── tools/                     # MCP tools and execution implementations
    │   ├── __init__.py            # Tools module exports
    │   ├── base.py                # BaseTool abstract base class
    │   ├── enums.py               # ToolName Enum definition
    │   ├── web_fetch.py           # Exa web content fetching tool implementation
    │   └── web_search.py          # Exa web search tool implementation
    └── utils/                     # Shared utilities and logging
```

---

## 7. Architecture Maintenance Policy

- `architecture.md` must be updated whenever any architectural change, structural modification, component addition, or design pattern change is made.
- Do not add dates to this document.
