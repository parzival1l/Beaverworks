# Agent Instructions (Backend)

## Scope
- Applies to everything under `backend/`.

## Rules
- Follow `.cursor/rules/core.mdc` (root) for TDD, architecture updates, and implementation style.
- Follow `.cursor/rules/git.mdc` (root) for git workflow and [`docs/ACTIVITY.md`](../docs/ACTIVITY.md).

## TDD (mandatory)
- All new backend behaviour follows **Red → Green → Refactor**.
- Write a failing test first, then write the minimum code to pass it, then refactor.
- Tests live in `backend/tests/`.
- Exceptions (docs, trivial config) must be noted inline.

## Expectations
- Keep backend changes minimal and task-focused.
- Preserve existing API behaviour unless the task explicitly changes it.
- Keep handlers thin — business logic in separate, testable functions.
- Run backend tests before finishing a task.

## Safety
- Avoid broad refactors during targeted fixes.
- Do not introduce breaking contract changes without explicit user approval.
- Never commit `.env`, credentials, or secrets.
