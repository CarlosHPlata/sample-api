# AGENTS.md — inventory-api

Guide for coding agents working in this repository. Humans: see `README.md`; this file carries the same facts plus the rules and traps.

## What this is

A small NestJS HTTP service: CRUD over inventory **products** (`id` UUID, `name`, `description`, `price`) plus `GET /health`. Products are stored **in memory** behind a repository port. There is no database, no auth, no external dependency. Keep it that small unless the task says otherwise.

## Commands

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server, hot reload | `npm run start:dev` (or `docker compose up --build`) |
| Build | `npm run build` → `dist/` |
| Run the build | `npm start` |
| All tests | `npm test` |
| One test file | `npm test -- src/products/products.service.spec.ts` |
| Typecheck src + test + scripts | `npx tsc --noEmit -p tsconfig.json` |
| Regenerate the API contract | `npm run openapi:generate` → `openapi.yml` |
| Production image | `docker build -t inventory-api .` |
| Release (tag + push) | `scripts/bump.sh` (menu + confirmation), or `scripts/bump.sh --minor -y`; `--help` for all flags |
| Preview release notes | `scripts/changelog.sh HEAD` |
| Check a commit message | `echo "feat: add x (INV-1)" \| npx commitlint` |

Node **24** (`.nvmrc`). Package manager: **npm** only; commit `package-lock.json`.

## Map

```
src/main.ts                    bootstrap: configureApp + Swagger UI at /docs + listen(PORT)
src/app.config.ts              global ValidationPipe; shared by main.ts AND the e2e tests
src/openapi.ts                 buildOpenApiDocument(): the only place the contract is assembled
src/health/                    GET /health → { status: 'ok', uptime }
src/products/
  products.controller.ts       routes, status codes, Swagger decorators. No business rules
  products.service.ts          business rules. Throws NotFoundException
  products.repository.ts       PORT (abstract class = DI token)
  in-memory-products.repository.ts   ADAPTER bound in products.module.ts
  product.entity.ts, dto/      shapes + class-validator rules
scripts/generate-openapi.ts    boots the app in-process (no listen) and dumps openapi.yml
scripts/bump.sh                next vX.Y.Z from git tags → tag HEAD → push (triggers the Release workflow)
scripts/changelog.sh           release notes (Markdown) from commit subjects since the previous stable tag
commitlint.config.mjs          commit message / PR title rules, shared by the hook and the PR check
.husky/commit-msg              runs commitlint on every commit (installed by `npm ci` via "prepare")
test/                          in-process HTTP tests + the contract test
```

Dependency direction: `controller → service → ProductsRepository (port) ← adapter`. The service must never import an adapter. A new storage backend is a new class extending `ProductsRepository` plus the `useClass` line in `products.module.ts`.

## Rules

1. **Changed an endpoint, a DTO, or a Swagger decorator? Run `npm run openapi:generate` and commit `openapi.yml` in the same change.** `test/openapi-contract.spec.ts` fails otherwise. Never edit `openapi.yml` by hand.
2. **Every DTO and entity property needs an explicit `@ApiProperty`.** The `@nestjs/swagger` CLI plugin is *not* enabled, on purpose: it only runs under `nest build`, so the generator script (`ts-node`) and the tests (`ts-jest`) would produce a different, emptier contract.
3. **Controller method names are public API**: they become the `operationId` in the contract (`listProducts`, `createProduct`, …). Renaming one is a contract change.
4. **Tests sit next to the code** (`*.spec.ts`); tests that need the whole app go in `test/`. Everything must run in-process with no network and no external service. New behaviour comes with a test; a bug fix comes with the test that would have caught it.
5. **Validation lives in DTOs**, not in controllers or services. The pipe runs with `whitelist` + `forbidNonWhitelisted`: unknown body fields are a `400`.
6. **Partial updates must ignore `undefined`.** With `target ≥ ES2022`, class fields exist as `undefined` own properties on DTO instances, so a naive `{ ...current, ...dto }` erases stored values. `ProductsService.update` filters them; keep that, and keep its test.
7. If you change HTTP-level behaviour (pipes, filters, prefixes), change it in `app.config.ts` so the e2e tests see the same app production runs.
8. `GET /health` must stay dependency-free and fast: the Dockerfile `HEALTHCHECK` and `docker compose --wait` poll it.
9. The last stage of the `Dockerfile` must remain the shippable `runtime` stage: a plain `docker build .` has to produce the production image.

## Toolchain traps (already solved, do not undo)

- **TypeScript is pinned to `^6`.** TypeScript 7.0 ships without the compiler API that `@nestjs/cli`, `ts-jest` and `ts-node` need. Do not bump to 7 until those tools support it.
- **Jest runs through `node --experimental-vm-modules`** (see `package.json` scripts). NestJS 12 packages are ES modules; plain `jest` fails with "Must use import to load ES Module". Requires Node ≥ 24.9.
- `tsconfig.json` sets `types` and `rootDir` explicitly because TypeScript 6 no longer infers them. `tsconfig.build.json` narrows `rootDir` to `src` so the entry point stays at `dist/main.js`.
- `js-yaml` is a **dev** dependency: only the generator script and the contract test use it. The runtime image is built with dev dependencies pruned.

## Definition of done

`npx tsc --noEmit -p tsconfig.json` clean · `npm test` green · `openapi.yml` regenerated if the API moved · `docker build .` succeeds · `README.md` and this file still describe reality.

## Conventions

- Commit messages and PR titles follow Conventional Commits **and end with a ticket**: `feat: add stock levels (INV-42)`, `fix(products)!: reject negative prices (INV-57)`. Lower-case type and description start; `!` for a breaking API change. Rules live in `commitlint.config.mjs`; the commit-msg hook and `.github/workflows/conventional-commits.yml` (PR title + every PR commit) both enforce them. Branch names follow the same types (`feat/...`, `fix/...`).
- PRs are squash-merged, so the PR title (or the commit's message, for a one-commit PR) becomes the commit on `main`, and `scripts/changelog.sh` builds release notes from those commits. A bad message is published in the release under "Not following Conventional Commits".
- The default branch is `main`.
