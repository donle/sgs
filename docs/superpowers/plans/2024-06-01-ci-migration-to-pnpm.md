# [CI Migration] From Yarn to pnpm

**Goal:** Replace `yarn` with `pnpm` in the GitHub Actions workflow for the `fix/p2p-connection-lint` branch.
**Architecture:** The project uses `pnpm` for workspace dependencies (`pnpm --dir ...`), but the CI workflow currently installs and uses `yarn`. We will update the workflow to install `pnpm` and use it for top-level scripts, aligning the CI with the project's actual dependency management strategy.

---

### Task 1: Update GitHub Actions Workflow

**Files:** `.github/workflows/nodejs.yml`

- [ ] Step 1: Open `.github/workflows/nodejs.yml`.
- [ ] Step 2: Replace `npm install -g yarn` with `npm install -g pnpm`.
- [ ] Step 3: Replace `yarn`, `yarn lint`, `yarn transpile`, and `yarn transpile:client` with `pnpm install`, `pnpm run lint`, `pnpm run transpile`, and `pnpm run transpile:client`.
- [ ] Step 4: Commit the changes.

