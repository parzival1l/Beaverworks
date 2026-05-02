# Agent Instructions (Workspace)

This file is the root instruction file for Cursor agents in this repository.

## Scope

- Applies to the whole repository unless a deeper `AGENTS.md` overrides it.

## Rules

- Follow `.cursor/rules/core.mdc` for TDD, architecture SSOT, and implementation style.
- Follow `.cursor/rules/git.mdc` for git workflow, branching, and ACTIVITY.md entries.

## Key Documents

- `[architecture.md](./architecture.md)` — single source of truth for system design. **Update it when the stack changes.**
- `[ACTIVITY.md](./ACTIVITY.md)` — session-level activity log. **Append an entry after every substantive change.**
- `[docs/feature-process.md](docs/feature-process.md)` — phase-level feature tracker. Update when a phase status changes.

## Expectations

- Keep changes focused to the user request.
- Prefer small, reviewable edits.
- Run relevant checks for touched areas before finishing.
- Do not modify unrelated files unless explicitly requested.
- **Do not commit or push without explicit user confirmation.**

## Path-specific behavior

- Use `backend/AGENTS.md` for backend-specific conventions.
- Use `frontend/AGENTS.md` for frontend-specific conventions.