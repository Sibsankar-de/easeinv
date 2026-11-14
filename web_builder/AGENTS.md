# AGENTS.md — Development Guidelines & Engineering Rules

Welcome to the `web_builder` codebase. This document outlines the mandatory engineering standards, development guidelines, coding conventions, and rules for all AI agents and developers working on this project. All architectural designs, infrastructure decisions, and component integrations are documented in `architecture.md`.

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
> - **Never Write Unnecessary or Futuristic Code:** Never write any unnecessary extra code, hypothetical features, speculative abstractions, or futuristic code that cannot even be used or has no immediate purpose. Keep every implementation strictly lean and directly tied to current requirements.
> - **Always Maintain High Code Quality:** Adhere to clean modular OOP, SOLID principles, robust error handling, precise naming, and strict type annotations without clutter, boilerplate, or over-engineering.
> - **Always take permission before doing anything that is not explicitly instructed.**
> - Keep changes strictly scoped to the exact task requested. Never anticipate or generate speculative implementations ahead of time.
> - **Separation of Concerns:** `AGENTS.md` is strictly for guidelines and rules. Do not document architecture here.
> - **Architecture Maintenance:** `architecture.md` must be updated whenever any architectural change or structural update is made.
> - **No Dates:** Do not add dates to `AGENTS.md` or `architecture.md`.

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
- **YAGNI & Lean Design (Zero Futuristic Code):**
  - Never add speculative methods, hypothetical feature flags, or futuristic code that is not actively used.
  - Implement only what is directly instructed and required right now.

---

## 6. Coding & Typing Standards

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

## 7. Guidelines & Architecture Policy

- **`AGENTS.md` (Strict Scope):** Serves solely as the source of truth for engineering guidelines, scope constraints, code commenting policies, typing standards, and strict agent rules. Architectural details must not be added here.
- **`architecture.md` (Living Architectural Source of Truth):** Serves as the source of truth for system architecture, infrastructure components, external integrations, design patterns, and structural designs. Whenever an architectural change, structural modification, or new integration is made, `architecture.md` **MUST** be updated immediately.
- **No Dates Policy:** Never add dates, timestamps, or date-based changelogs to `AGENTS.md` or `architecture.md`.
