# Agent Instructions (Data)

Charity datasets that feed the ingest pipeline. **Mix of hand-curated and generated files — know which is which before editing.**

## Files

| File                                | Status        | Source of truth?    | Notes                                                                                  |
| ----------------------------------- | ------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `charities.seed.json`               | **Curated**   | **Yes** (8 records) | Full `Charity` shape; primary input to `scripts/ingest-charities.ts`. Edit here.       |
| `Charities_results_*.txt`           | **Raw input** | Yes (CRA export)    | CRA "Charities listings" search export. **Encoding: ISO-8859 (Latin-1).** TSV, 14 cols, CRLF. |
| `charities.cra.json`                | **Generated** | No                  | Produced by `backend/src/parsers/cra-charities/cli.ts` from the newest `Charities_results_*.txt`. Do **not** hand-edit. |
| (optional) `charities.csv`          | Curated input | If present          | RFC4180-ish; consumed by `scripts/ingest-charities.ts` ahead of seed JSON.             |
| (optional) `charities.txt`          | Curated input | If present          | CRA-detail copy/paste blocks; consumed by ingest ahead of seed JSON.                   |

`scripts/ingest-charities.ts` resolves inputs in this order: `charities.csv` → `charities.txt` → `charities.seed.json`. Whichever it finds, it writes `charities.seed.json` back out (canonical form) plus the agent-side artifacts under `agent/data/`.

## Schema (canonical `CharityRecord`)

Defined in `scripts/ingest-charities.ts` and mirrored in `frontend/src/types/charity.ts`, `backend/src/types/search.ts` (`CharityRecord`), and the agent metadata map. Top-level fields: `id`, `bnRegistrationNumber` (CRA `123456789 RR 0001`), `organizationName`, `charityStatus`, `typeOfQualifiedDonee`, `effectiveDateOfStatus`, `description`, `sanction`, `designation`, `charityType`, `category`, `address`, `city`, `provinceTerritory`, `country`, `postalCode`, `financial: {...}`, `tags: string[]`.

`id` convention: `bn-<9digits>-rr<4digits>` (see `charityIdFromBn()`).

## Workflow

1. To add/edit charities for the demo: edit `charities.seed.json`.
2. To refresh from the CRA: drop a new `Charities_results_*.txt` here, then run the CRA parser CLI (see `backend/src/parsers/cra-charities/AGENTS.md`).
3. After **either** kind of edit, run the full ingest from the repo root:
   ```bash
   npx tsx scripts/ingest-charities.ts
   cd agent && adk kb sync --dev    # only if `adk dev` is running
   ```

## Anti-patterns

- Editing `charities.cra.json` by hand. It is regenerated; commit the parser change or the source TSV instead.
- Saving `Charities_results_*.txt` as UTF-8 — French accents will mojibake. Keep ISO-8859/Latin-1 (the parser decodes with `latin1`).
- Adding fields to `charities.seed.json` without updating the `CharityRecord` interface in `scripts/ingest-charities.ts` and the mirrored types in `frontend/`/`backend/`.
- Committing PII or non-public charity data — only public CRA registry data belongs here.
- Skipping the ingest step after editing the seed: the agent KB will be stale until `scripts/ingest-charities.ts` runs and `adk kb sync --dev` is invoked.
