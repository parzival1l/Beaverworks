# Agent Instructions (Frontend)

## Scope
- Applies to everything under `frontend/`.

## Rules
- Follow `.cursor/rules/core.mdc` (root) for TDD, architecture updates, and implementation style.
- Follow `.cursor/rules/git.mdc` (root) for git workflow and ACTIVITY.md.

## TDD (mandatory)
- All new frontend behaviour follows **Red → Green → Refactor**.
- Write a failing test first, then write the minimum code to pass it, then refactor.
- Tests live in `frontend/src/__tests__/` or co-located with components.
- Exceptions (pure markup, trivial config) must be noted inline.

## Expectations
- Keep UI behaviour consistent unless changes are explicitly requested.
- Preserve accessibility and keyboard interactions.
- Match existing component and styling patterns.
- Run frontend tests before finishing a task.

## Quality
- Prefer small, readable component changes over broad rewrites.
- Keep components focused — extract logic into testable hooks or utilities.
- Never commit `.env` or secrets.
