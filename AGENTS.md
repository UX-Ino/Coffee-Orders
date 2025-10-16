# Repository Guidelines

## Project Structure & Module Organization
- Code: place implementation under `src/` (language-agnostic). Current repo includes:
  - `spec/`: requirements, design, and task docs.
  - `커피데이터.csv`: sample data file in the project root.
- Tests: mirror `src/` under `tests/` (e.g., `tests/orders/test_parser.py`).
- Assets/fixtures: store in `assets/` or `tests/fixtures/` as needed.

## Build, Test, and Development Commands
- No build tooling is defined yet. Recommended patterns:
  - Python: `python -m venv .venv && source .venv/bin/activate`, `pip install -r requirements.txt`, `pytest -q`.
  - Node.js: `npm install`, `npm test`, `npm run dev`.
- When adding tooling, document commands in `README.md` and prefer `Makefile` or `package.json` scripts for repeatable tasks.

## Coding Style & Naming Conventions
- General: 2-space indentation; wrap at ~100 characters; small, pure functions.
- Python: format with `black`; lint with `ruff`; files `snake_case.py`; classes `PascalCase`; functions/vars `snake_case`.
- TypeScript/JS: format with `prettier`; lint with `eslint`; files `kebab-case.ts`; types/interfaces `PascalCase`.
- Markdown docs: sentence-case headings; keep docs in `spec/` or `docs/`.

## Testing Guidelines
- Scope: unit-test parsing, pricing, and order logic; keep tests deterministic.
- Layout: mirror code under `tests/`; use fixtures in `tests/fixtures/`.
- Naming: describe behavior (e.g., `test_calculates_total_with_discounts`).
- Coverage: target ≥80% for new/changed code; include edge cases around empty or malformed CSV rows.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits (e.g., `feat: add order parser`, `fix: handle empty CSV`).
- PRs: one topic per PR; link issues; include summary, rationale, and test plan; attach screenshots for UI changes.
- Checklist: tests added/updated; docs updated; breaking changes called out with migration notes.

## Security & Configuration Tips
- Never commit secrets; use `.env` and provide `.env.example`.
- Store large datasets in `data/` (consider Git LFS) and reference paths, not absolute locations.
