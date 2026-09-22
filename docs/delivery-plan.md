# Delivery plan

## Phase 1 - Reproducible vertical slice

- [x] Create the Playwright TypeScript project and layered folders.
- [x] Configure two desktop browsers and one mobile emulation.
- [x] Add configurable, bounded user generation.
- [x] Add corrected Flyway migration and independent DML seed.
- [x] Add MySQL, Flyway and WireMock Compose services with ordered startup.
- [x] Add UI, database and expanded API tests.
- [x] Add sequential orchestration, separate reports, linting, formatting, Husky and CI.
- [ ] Execute the complete stack on a machine with Docker and record the first green run.

Exit criterion: a clean checkout passes with `docker compose up -d --wait` followed by
`npm run test:e2e`.

## Phase 2 - Test robustness

- [ ] Generate Linux visual baselines and evaluate screenshot thresholds.
- [ ] Add WireMock request-journal verification for important calls.
- [ ] Add a boundary matrix for `USER_COUNT`, `MAX_USER_COUNT` and `USER_ID_START`.
- [ ] Add database assertions for exact role combinations, not only role presence.
- [ ] Decide whether persistent local data or per-run isolated databases better fit the review.

Exit criterion: repeated local and CI runs have no unexplained flakes.

## Phase 3 - Reporting and observability

- [ ] Decide between merged Playwright blob reports and the current separate HTML reports.
- [ ] Add a concise generated summary with counts by suite and browser.
- [ ] Attach Docker and Flyway diagnostics only when a test phase fails.
- [ ] Confirm artifacts do not contain credentials or sensitive headers.

Exit criterion: a reviewer can understand a failure from the uploaded artifact without rerunning it.

## Phase 4 - Final review package

- [ ] Run the project from a fresh clone using only README instructions.
- [ ] Review dependency and Docker image pins.
- [ ] Review SQL corrections and assumptions with the task document side by side.
- [ ] Capture final commands and results in the README.
- [ ] Prepare a short walkthrough: architecture, tradeoffs, risks and next improvements.

Exit criterion: the repository can be submitted without verbal setup instructions.
