# Keukensenmeer.nl development Instructions for Copilot

## Purpose

This project uses **Nuxt 4 with TypeScript** on **NuxtHub (CF Workers)**, with **Nuxt UI Pro** for components.
Copilot should generate code that fits seamlessly into this setup, respecting CI, linting, and release rules.

---

## General Rules

* **No `any` types**: Always use precise, inferred, or narrowed types. If Copilot suggests `any`, replace it with explicit typing or safe narrowing.
* **Full TSDoc for exports**:

  * Every exported function, composable, component, and API route must include detailed TSDoc.
  * Include `@param`, `@returns`, `@example`, and `@throws` where relevant.
* **Edge-safe**: Only use web-standard APIs (e.g. `fetch`, `URL`, `crypto.subtle`). Avoid Node built-ins (`fs`, `path`, `process`, etc.).
* **Nuxt conventions**:

  * Business logic in `/composables`
  * Server logic in `/server/api` or `/server/routes`
  * UI built with Nuxt UI Pro
  * Images via `@nuxt/image`, fonts via `@nuxt/fonts`
  * SEO via `@nuxtjs/seo` (`useSeoMeta`, config defaults)

---

## Code Style

* Prefer **type inference** when safe; avoid redundant explicit types.
* Use **guards** or `satisfies` for narrowing when handling unknown JSON.
* Follow ESLint rules automatically (configured via `@nuxt/eslint`).
* Keep functions **small, pure, and readable**.
* Structure state with `useState`, not global singletons.
* Favor composables for reusability.

---

## Commit & CI

* **Commits**: Must follow [conventional commits](https://www.conventionalcommits.org/).

  * Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`.
  * Subjects must be **sentence case** and ≤ **93 characters**.
* **Pre-commit**: `eslint` & `typecheck` must pass.
* **Releases**: Handled by semantic-release. Don’t bump versions manually.

---

## Reminders for Copilot

When generating code:

* “Does this run on Cloudflare Workers?” → Yes: use only edge-compatible APIs.
* “Am I returning strongly typed, validated data?” → Yes: avoid unsafe shapes.
* “Did I add TSDoc for exports?” → Always.
* “Does this fit Nuxt’s structure?” → Use composables, server routes, and Nuxt UI Pro.
* “Will it pass lint, commitlint, and CI?” → Respect configured rules.
