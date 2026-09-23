# Delivery plan

## Phase 1 - Reproducible vertical slice

- [x] Create the Playwright TypeScript project and layered folders.
- [x] Configure two desktop browsers and one mobile emulation.
- [x] Add configurable, bounded user generation.
- [x] Add corrected Flyway migration and independent DML seed.
- [x] Add MySQL, Flyway and WireMock Compose services with ordered startup.
- [x] Add UI, database and expanded API tests.
- [x] Add sequential orchestration, separate reports, linting, formatting, Husky and CI.
- [x] Execute the complete stack with Docker and record the first green GitHub Actions run.

Exit criterion: a clean checkout passes with `docker compose up -d --wait` followed by
`npm run test:e2e`.

## Phase 2 - Test robustness

- [x] Evaluate golden-image baselines and document why stable-element assertions plus screenshot
      evidence are used for the external DemoQA page.
- [ ] Add WireMock request-journal verification for important calls.
- [ ] Add a boundary matrix for `USER_COUNT`, `MAX_USER_COUNT` and `USER_ID_START`.
- [x] Assert the required role catalog and differing combinations without treating the seed's ID
      formula as a business rule.
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
