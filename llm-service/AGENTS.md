# AGENTS.md — Development Guidelines & Architectural Standards

Welcome to the `llm-service` codebase. This document outlines the mandatory engineering standards, architectural patterns, Low-Level Design (LLD) principles, and file conventions for all AI agents and developers working on this project.

---

## 1. Project Overview & Purpose

`llm-service` is the dedicated AI microservice node within the **easeinv** ecosystem.

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
llm-service/
├── AGENTS.md                      # Agent and developer guidelines (this file)
├── README.md                      # Project documentation and setup guide
├── pyproject.toml                 # uv package configuration and dependencies
├── uv.lock                        # Locked dependency graph
├── .python-version                # Pinned Python version (3.12+)
├── main.py                        # Service entrypoint
└── src/
    ├── app.py                     # FastAPI application instance and lifecycle
    ├── settings.py                # Configuration and environment settings
    ├── services/                  # Business logic domain services (OOP classes)
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
