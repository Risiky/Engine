# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the production modules; keep each agent or subsystem in its own subpackage (for example, `src/orchestrator`, `src/tools`) and expose public entry points through `src/__init__.py`.
- `tests/` mirrors the `src` tree one-to-one (e.g., logic in `src/orchestrator/router.py` is validated by `tests/orchestrator/test_router.py`).
- `assets/` stores prompt fixtures, synthetic datasets, and diagrams under descriptive folders (`assets/prompts`, `assets/diagrams`).
- `scripts/` carries repeatable automation such as `scripts/bootstrap.ps1` for environment setup and `scripts/smoke.py` for ad-hoc checks; keep these scripts idempotent and well-commented.

## Build, Test, and Development Commands
- `python -m venv .venv && .\\.venv\\Scripts\\activate` creates an isolated interpreter for contributors on Windows.
- `pip install -r requirements.txt -r requirements-dev.txt` installs runtime dependencies plus tooling (ruff, pytest, build).
- `python -m build` packages the project for release; artifacts appear under `dist/`.
- `pytest` runs the default suite, while `pytest -m e2e` executes slower integration journeys.
- `ruff check src tests` and `ruff format src tests` provide linting and formatting¡ªrun them before every commit or wire them into your editor.

## Coding Style & Naming Conventions
- Use PEP 8 alignment with 4-space indentation, double quotes for strings, and type hints on all public functions.
- Modules use snake_case filenames, classes use PascalCase, and functions/variables remain snake_case.
- Keep functions short (<40 lines) and document non-trivial behavior with docstrings following Google style.

## Testing Guidelines
- Prefer pytest fixtures for shared setup; place factory helpers in `tests/conftest.py`.
- Name tests `test_<behavior>_should_<result>` to describe intent.
- Target ¡Ý90% line coverage for core orchestrator modules; check `coverage.xml` before merging and fail CI if thresholds drop.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(parser): add slot filling`) so changelog automation remains accurate.
- Each PR must include: summary bullet list, linked issue or ticket, screenshots/logs for UX-visible work, and checkboxes confirming lint + tests.
- Keep PRs under ~400 LOC of deltas; split larger efforts into stacked branches to ease review.

## Security & Configuration Tips
- Never commit `.env`, API keys, or raw conversation logs; add new files to `.gitignore` and prefer referencing secrets via the runner¡¯s secure store.
- Review third-party dependencies quarterly and pin versions in `requirements*.txt` to avoid supply-chain drift.
