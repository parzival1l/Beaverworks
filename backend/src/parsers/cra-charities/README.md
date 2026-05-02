# CRA Charities Parser

Converts the CRA "Charities listings – search results" TSV export
(`data/Charities_results_*.txt`) into seed JSON that matches
`data/charities.seed.json`.

## Why it's here (and why it's shaped this way)

This parser lives in `backend/` because the backend is our general-purpose
Node/TypeScript workspace with a test runner set up. The **layout and
conventions are modelled on the Botpress ADK** (`.cursor/rules/botpress-adk.mdc`),
so the same functions can be lifted into the ADK `agent/` project as
`Action`s without rewriting anything:

| ADK rule                                    | How this parser follows it                                      |
| ------------------------------------------- | --------------------------------------------------------------- |
| **One primitive per file**                  | Each action lives in its own file under `actions/`.             |
| **Use Zod for all schemas**                 | Inputs/outputs validated via `schemas.ts` (`CraRowZ`, `CharityRecordZ`, …). |
| **Pure, composable actions**                | `parseCraExport` = `parseCraTsv` + `mapCraRowToCharity`.        |
| **No hidden IO inside logic**               | File reads/writes are in `cli.ts` and `writeSeedJson`, never in parsers. |
| **Every exported symbol has a type**        | Types are `z.infer<>` from the schemas.                          |

If we later want the agent to ingest CRA data at runtime, each file becomes
a `new Action({ name, input, output, handler })` — the `handler` body stays
the same because it's already just an async/pure function of validated input.

## Folder layout

```
backend/src/parsers/cra-charities/
├── schemas.ts                 # Zod schemas + shared constant maps
├── actions/
│   ├── parseCraTsv.ts         # raw TSV text → CraRow[]
│   ├── mapCraRowToCharity.ts  # CraRow → seed CharityRecord
│   ├── parseCraExport.ts      # end-to-end pipeline (filter, cap, map)
│   └── writeSeedJson.ts       # side-effecting writer (kept isolated)
├── cli.ts                     # runnable CLI
├── index.ts                   # barrel
└── README.md
```

## CLI

```bash
# From the repo root:
npx tsx backend/src/parsers/cra-charities/cli.ts \
  --in  data/Charities_results_2026-05-02-13-43-32.txt \
  --out data/charities.cra.json \
  --only-registered \
  --limit 50
```

Defaults: auto-picks the newest `data/Charities_results_*.txt`, no status
filter, no limit, writes to `data/charities.cra.json`.

## Tests

```bash
cd backend && npm test -- tests/parsers/cra-charities
```

## Notes on the source format

- Tab-delimited, 14 columns, CRLF line endings.
- **Encoding:** ISO-8859 (Latin-1). The CLI decodes with `latin1` so French
  accents survive the trip into UTF-8 JSON.
- Designation codes: `0001` = Charitable organization, `0002` = Public
  foundation, `0003` = Private foundation.
- Financials are **not** in the list export; `mapCraRowToCharity` zero-fills
  them to keep the seed JSON shape intact.
