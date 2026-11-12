# AGENTS.md — Development Guidelines & Architectural Standards

Welcome to the `web_builder` codebase. This document outlines the mandatory engineering standards, architectural patterns, Low-Level Design (LLD) principles, and file conventions for all AI agents and developers working on this project.

---

## 1. Project Overview & Purpose

`web_builder` is the dedicated AI microservice node within the **easeinv** ecosystem.

### High-Level Goal:

The primary purpose of this service is building an AI agent responsible for creating online store web platforms in easeinv.

---

## 2. Strict Scope & Permission Policy (MANDATORY)

> **CRITICAL RULES:**
>
> - **Never pre-assume anything:** The agent must never make assumptions, speculate, extrapolate, or invent requirements, responsibilities, features, or details on its own.
> - **Do NOT add any files, boilerplate, mock implementations, libraries, endpoints, or features that were not explicitly instructed.**
> - **Always take permission before doing anything that is not explicitly instructed.**
> - Keep changes strictly scoped to the exact task requested. Never anticipate or generate speculative implementations ahead of time.
> - **Living Document:** This file must be updated whenever any architectural update, design decision, or structural change is made.

---

## 3. Tooling & Environment Standards (`uv`)

This project is strictly managed with [`uv`](https://github.com/astral-sh/uv). Do not use bare `pip`, `poetry`, or `conda`.

### Standards:

- All dependency additions, syncing, testing, and script executions must go through `uv`:
  - `uv sync` to sync the environment.
  - `uv add <package>` for runtime dependencies.
  - `uv add --dev <package>` for development dependencies.
  - `uv run <command>` to execute processes within the managed environment.

---

## 4. Code Commenting Policy (STRICT)

Maintain a clean, self-documenting codebase. Unnecessary comments add noise, degrade readability, and go stale.

### Rules:

1. **Never add trivial or unnecessary comments:**
   - Do not write comments explaining what the code is visibly doing (e.g., `# parse request`, `# call service`, `# return response`, `# loop through items`, `# initialize list`).
   - Do not add section separator comments (e.g., `# ==================== IMPORTS ====================`).
   - Do not add file header banners or author signatures.
2. **Never leave dead or commented-out code:**
   - Dead code must be deleted immediately. Version control preserves history.
3. **No redundant docstrings:**
   - Do not write docstrings that merely restate function or class names.
4. **When comments/docstrings ARE acceptable:**
   - Documenting non-obvious business domain rationale or critical financial invariants (e.g., compliance constraints, specific tax calculation rounding rules).
   - Documenting complex mathematical algorithms or workarounds for third-party upstream quirks.
5. **Rely on self-documenting code:**
   - Express intent through precise naming of classes, methods, variables, and parameters.
   - Use explicit static typing and schema validation.

---

## 5. Low-Level Design (LLD) & Modular OOP Architecture

All code must follow clean modular programming using Object-Oriented Programming (OOP) and SOLID design principles. Avoid procedural script-style logic in handlers or utilities.

### Design Principles:

- **Single Responsibility Principle (SRP):**
  - Routers only validate input schemas, delegate to services, and return responses.
  - Services encapsulate business logic and domain rules.
  - Providers/adapters encapsulate vendor LLM communication and SDK abstractions.
  - Schemas define and validate data transfer objects (DTOs).
- **Open/Closed Principle (OCP) & Liskov Substitution Principle (LSP):**
  - Define extensible interfaces using Abstract Base Classes (`abc.ABC`) or `typing.Protocol`.
  - Adding a new LLM provider must only require implementing the base provider class without modifying existing provider implementations.
- **Dependency Inversion Principle (DIP):**
  - High-level modules must not depend directly on concrete low-level SDKs.
  - Services must receive provider instances via constructor injection (`__init__`).
  - FastAPI endpoints must inject dependencies via FastAPI's `Depends`.

---

## 6. Project Directory Structure

Maintain a clean, semantic file structure when instructed to build components:

```
web_builder/
├── AGENTS.md                      # Agent and developer guidelines (this file)
├── README.md                      # Project documentation and setup guide
├── pyproject.toml                 # uv package configuration and dependencies
├── uv.lock                        # Locked dependency graph
├── .python-version                # Pinned Python version (3.12+)
├── .env.example                   # Environment variable template
├── docker-compose.yml             # Docker services (SeaweedFS S3 object storage)
├── main.py                        # Service entrypoint
└── src/
    ├── app.py                     # FastAPI application instance and lifecycle
    ├── settings.py                # Configuration and environment settings
    ├── config/                    # Infrastructure and client connection configurations
    │   ├── __init__.py            # Config module exports
    │   ├── exa.py                 # Exa API configuration and async client provider
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

## 7. Coding & Typing Standards

- **Strict Type Annotations:** Every function signature, method parameter, class attribute, and return value must be explicitly typed.
- **Python 3.12+ Modern Typing:**
  - Use `int | None` instead of `Optional[int]`.
  - Use `list[str]`, `dict[str, Any]`, `tuple[int, ...]` instead of `typing.List`, `typing.Dict`.
  - Avoid `Any` whenever a concrete type or Pydantic model can be defined.
- **Naming Conventions:**
  - Packages and modules: `snake_case`.
  - Classes and Exceptions: `PascalCase`.
  - Functions and methods: `snake_case`.
  - Constants and Settings: `UPPER_SNAKE_CASE`.
- **Imports:** Group imports logically (Standard library, third-party libraries, local project modules).

---

## 8. Living Document & Decision Tracking Policy

`AGENTS.md` is a living document that serves as the single source of truth for architectural standards and project conventions.

### Rules:

- Whenever an architectural update, design decision, or structural modification is agreed upon, this file **MUST** be updated immediately to reflect the change.
- New patterns, interfaces, services, or workflow changes must be documented here before or alongside their implementation.
- All future contributors and AI agents must review and uphold the latest decisions recorded in this document.

---

## 9. Architectural Decisions & Changelog

### 2026-11-10: S3 Object Storage Integration (SeaweedFS)
- **Storage Backend:** SeaweedFS running via Docker Compose (`docker-compose.yml`) in all-in-one mode (`weed server -s3`) with persistent volume `seaweedfs_data`.
- **SDK:** `boto3` managed via `uv`.
- **Configuration Layer:** `src/config/s3.py` provides `S3Config` (implements `S3ClientProvider` protocol) and client factory functions (`get_s3_config`, `get_s3_client`).
- **Environment Settings:** `src/settings.py` manages S3 parameters (`S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION_NAME`, `S3_BUCKET_NAME`) loaded from `.env` with a corresponding `.env.example`.

### 2026-11-12: FastMCP Server & Client Integration
- **Framework:** `fastmcp` managed via `uv`.
- **MCP Server:** `src/mcp/server.py` defines `MCPServer` (implementing `MCPServerProvider` protocol) and `get_mcp_server()`. Configured with `MCP_SERVER_NAME` from `src/settings.py`.
- **MCP Client:** `src/mcp/client.py` provides `MCPClientManager` (implementing `MCPClientProvider` protocol) and `get_mcp_client()` for async connection management.
- **FastAPI Lifecycle:** `src/app.py` utilizes FastAPI `lifespan` context manager to connect the MCP client to the FastMCP server on application startup and store it in `app.state.mcp_client`.

### 2026-11-12: Exa Tools & Enum Map Integration
- **SDK:** `exa-py` managed via `uv`.
- **Configuration Layer:** `src/config/exa.py` provides `ExaConfig` (implementing `ExaClientProvider` protocol) and client factory functions (`get_exa_config`, `get_exa_client`) utilizing `EXA_API_KEY` from `src/settings.py`.
- **Tools Architecture (`src/tools/`):**
  - `src/tools/enums.py`: `ToolName` Enum defining tool identifiers (`web_search`, `web_fetch`).
  - `src/tools/base.py`: `BaseTool` abstract base class defining tool protocol and execution interface.
  - `src/tools/web_search.py`: `WebSearchTool` executing Exa search.
  - `src/tools/web_fetch.py`: `WebFetchTool` executing Exa contents fetch.
- **MCP Tool Registry & Registration (`src/mcp/`):**
  - `src/mcp/registry.py`: Defines `TOOLS_MAP` (`dict[ToolName, BaseTool]`), tool lookup utilities, and `register_tools()` for FastMCP registration.
  - `src/mcp/server.py`: Registers tools in FastMCP using the `ToolName` Enum values on server instantiation.
