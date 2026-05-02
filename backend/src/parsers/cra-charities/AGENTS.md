# Agent Instructions (CRA Charities Parser)

Converts the CRA "Charities listings – search results" TSV export (`data/Charities_results_*.txt`) into seed JSON matching `data/charities.seed.json`.

> See also: `[README.md](README.md)` in this folder for the rationale and the ADK-shaped layout. This file is the agent-facing summary + pitfalls.

## Layout (ADK-shaped — one primitive per file)

```
backend/src/parsers/cra-charities/
├── schemas.ts                   # Zod schemas + shared maps (CraRowZ, CharityRecordZ)
├── actions/
│   ├── parseCraTsv.ts           # raw TSV text → CraRow[]
│   ├── mapCraRowToCharity.ts    # CraRow → seed CharityRecord
│   ├── parseCraExport.ts        # end-to-end: filter → cap → map
│   └── writeSeedJson.ts         # side-effecting writer (kept isolated)
├── cli.ts                       # runnable CLI (only IO)
├── index.ts                     # barrel
└── README.md
```

Each `actions/*.ts` is a pure async function of validated input — designed to be lifted into the ADK `agent/` workspace as `new Action({ name, input, output, handler })` without rewriting the body.

## CLI

```bash
# From repo root:
npx tsx backend/src/parsers/cra-charities/cli.ts \
  --in  data/Charities_results_2026-05-02-13-43-32.txt \
  --out data/charities.cra.json \
  --only-registered \
  --limit 50
```

Defaults: auto-picks the newest `data/Charities_results_*.txt`, no status filter, no limit, writes `data/charities.cra.json`.

## Source format (DO NOT GET THIS WRONG)

- **Encoding: ISO-8859 (Latin-1).** Decoded with `latin1` so French accents survive. UTF-8 reads will mojibake.
- Tab-delimited, **14 columns**, CRLF line endings.
- Designation codes: `0001` charitable organization, `0002` public foundation, `0003` private foundation.
- Financials are **not** in the listings export — `mapCraRowToCharity` zero-fills them so the seed JSON shape stays intact.

## Tests

```bash
cd backend && npm test -- tests/parsers/cra-charities
```

16 tests covering schemas, parser, mapper, end-to-end pipeline. Add a Red test before any behaviour change.

## Anti-patterns

- Using `readFileSync(path, 'utf-8')` for the CRA TSV. Always `latin1`.
- Doing IO inside `actions/parseCraTsv.ts` or `actions/mapCraRowToCharity.ts`. IO lives in `cli.ts` and `writeSeedJson.ts`; actions stay pure.
- Bypassing the Zod schemas in `schemas.ts`. The whole point of this layout is that inputs/outputs are validated; if a column changes, update `CraRowZ` first and let the type errors guide the fix.
- Writing the parser output anywhere other than `data/charities.cra.json` by default — that path is what downstream tooling expects.
- Adding fields to `CharityRecord` here without also updating `scripts/ingest-charities.ts`, `frontend/src/types/charity.ts`, and `backend/src/types/search.ts` (the canonical shape is shared across the repo).
