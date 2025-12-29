# Agent OS Configuration

This directory contains the configuration and definitions for "Agent OS," a framework for AI agents to plan, specify, implement, and verify software projects. It serves as the "brain" or "instruction manual" for the AI agent itself.

## Directory Overview

- **`.claude/`**: Contains the core definitions for the AI agent.
    - **`agents/`**: Defines specific personas/roles (e.g., `product-planner`, `spec-writer`, `implementer`) and their responsibilities.
    - **`commands/`**: High-level prompts and instructions for executing specific workflows (e.g., `plan-product`, `implement-tasks`).
    - **`skills/`**: detailed guides on specific technical capabilities (e.g., `frontend-css`, `backend-api`).

- **`agent-os/`**: Contains the concrete operational standards and workflows.
    - **`config.yml`**: Main configuration file for the Agent OS.
    - **`commands/`**: detailed, step-by-step workflows for the commands defined in `.claude`.
    - **`standards/`**: The authoritative source for coding standards, conventions, and technology choices.
        - **`global/`**: Cross-cutting concerns like tech stack, coding style, and error handling.
        - **`frontend/`**: Specifics for UI, CSS, and components.
        - **`backend/`**: Specifics for API, database, and migrations.

## Key Concepts

### Agents
The system is divided into specialized agents, each with a specific focus:
- **Product Planner**: Defines the mission, roadmap, and tech stack.
- **Spec Shaper/Writer**: Converts high-level requirements into detailed technical specifications.
- **Implementer**: Writes the code to fulfill the specifications.
- **Verifier**: Ensures the implementation matches the spec and standards.

### Standards & Tech Stack
The `agent-os/standards` directory defines the "Gold Standard" for projects built using this system. Unless overridden by a specific project requirement, the default stack is:

- **Languages**: TypeScript (Primary), Python (Scripts), C#/.NET (Enterprise).
- **Frontend**: React + Vite (Primary), Next.js (Secondary).
- **Backend**: Bun (Express/Fastify/NestJS) or .NET.
- **Database**: Firebase/Google Cloud (Firestore, Cloud SQL).
- **Styling**: Tailwind CSS (Primary).

## Usage

When working in this environment or a project managed by it:
1.  **Reference Standards**: Always consult `agent-os/standards` before making architectural decisions or writing code.
2.  **Follow Workflows**: Use the structured processes defined in `agent-os/commands` for complex tasks (e.g., don't just "write code," follow the `implement-tasks` workflow).
3.  **Adopt Personas**: When asked to perform a specific type of task (e.g., "plan this product"), adopt the mindset and constraints of the relevant agent (e.g., `product-planner`).
