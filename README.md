# Nuxt 4 app for keukensenmeer.nl

Brief description of what this application does and its purpose.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Development

### Prerequisites

- Node.js 22+
- pnpm 10+
- gitleaks (for pre-commit secret scanning)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix

### TypeScript & `vue-tsc` Version Pinning

When running `pnpm typecheck`, you may see errors like:

```
Search string not found: "/supportedTSExtensions = .*(?=;)/"
```

This is caused by an incompatibility between newer **TypeScript** releases (≥5.7) and `vue-tsc`
≤2.1.x. Internally, `vue-tsc` patches parts of TypeScript's compiler, but recent changes in
TypeScript broke that patching logic.

To ensure reliable type checking, we **pinned both versions** to a known-working combination:

```jsonc
"devDependencies": {
  "typescript": "5.6.2",
  "vue-tsc": "2.0.29"
}
```

This avoids the runtime error and keeps `nuxi typecheck` stable. If you need to upgrade TypeScript
in the future, make sure to update `vue-tsc` to a version that explicitly supports it.

## Tech Stack

### Core Framework

- **[Nuxt 4](https://nuxt.com/)**: The Intuitive Vue Framework

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- Additional UI components and styling libraries (to be documented)

### Development Tools

- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[ESLint](https://eslint.org/)**: Code linting and formatting

## Project Structure

```
/
├── app/                 # Application source code
├── public/              # Static assets
├── server/              # Server-side code
├── .nuxt/              # Generated files (auto-generated)
└── ...
```

## Deployment

Deployment configuration and instructions will be added here.

## Contributing

Guidelines for contributing to the project will be added here.

## License

License information will be added here.
