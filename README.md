# Nuxt 4 app for keukensenmeer.nl

A small static site for Keuken & Meer, built with Nuxt 4, Nuxt UI and NuxtHub.

## Overview

This project leverages the full power of the Nuxt and Vue ecosystems to deliver a fast, modern
website. Key features include:

- **Nuxt 4**: The latest version of the Nuxt framework for building Vue.js applications.
- **Static Site Generation**: Pre-renders pages for optimal performance and SEO.
- **TypeScript**: Strongly typed JavaScript for improved developer experience.
- **Tailwind CSS**: Uses Nuxt UI 4 with Tailwind 4 for utility-first styling.
- **SEO Optimization**: Uses NuxtSEO for meta tags and schemas.
- **Static data**: Due to the nature of the site, all data is static and either hardcoded or defined
  in data files. These files are then served through the Nuxt server routes.
- **Edge Runtime**: Deployed to Cloudflare Workers through NuxtHub for global low-latency delivery.

## Prerequisites

- **Node.js**: 22+ (LTS recommended)
- **pnpm**: 10+
- **gitleaks**: 8+ (for security scanning)

If working in vscode, it's recommended to install the following extensions:

- [Vue Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Nuxtr](https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxtr-vscode).
- [Nuxt Extension Pack](https://marketplace.visualstudio.com/items?itemName=Nuxtr.nuxt-vscode-extentions)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [PostCSS Vue](https://marketplace.visualstudio.com/items?itemName=SamaTech.postcss-vue)

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd keukensenmeer

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Start development server
pnpm dev
```

## Development

This project uses pnpm as package manager. Make sure to install dependencies with `pnpm install`
before running any scripts.

Other development tools you need to be aware of are:

- **TypeScript**: for static type checking
- **ESLint**: for code linting and formatting
- **Husky**: for git hooks to enforce code quality before commits and pushes
- **Gitleaks**: for scanning sensitive information in git history and staged files
- **Commitlint**: for enforcing conventional commit messages

### Available Scripts

When developing this project, you can use the following scripts. Most of these commands have a handy
VS Code task for easy access.

#### Core Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build

#### Code Quality

- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with caching
- `pnpm lint:fix` - Run ESLint with auto-fix

#### Data processing

- `pnpm generate-projects` - Generate project index file from `/data/projects/` files

#### Analysis & Debugging

- `pnpm analyze` - Analyze bundle size and performance
- `pnpm preview:edge` - Build and preview on NuxtHub edge runtime
- `pnpm debug:edge` - Build with debug mode and preview on edge runtime

#### Dependency Management

- `pnpm bump:patch` - Update patch version dependencies
- `pnpm bump:minor` - Update minor version dependencies
- `pnpm bump:major` - Update all dependencies to latest versions
- `pnpm nuxt:upgrade` - Upgrade Nuxt to latest version with deduplication

#### Internal Scripts

- `pnpm prepare` - Setup Husky git hooks (runs automatically after install)
- `pnpm postinstall` - Prepare Nuxt (runs automatically after install)

### Creating new releases

Releases are managed automatically through semantic-release. To create a new release, simply merge
your changes into the `main` branch with a properly formatted commit message. The CI/CD pipeline
will handle version bumping, changelog generation, and deployment of the new release.

#### Release application

In order to automatically create releases, you need to set up a GitHub App with the following
permissions:

- Repository contents: Read & Write
- Pull requests: Read & Write
- Issues: Read & Write
- Commit statuses: Read
- Metadata: Read only

You will also need to generate a private key for the app to authenticate with GitHub during the
release process (see [Environment Variables](#environment-variables) section below).

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root
directory with the following variables:

### Required environment variables

```env
# dev, preview, production
MODE="dev"
PLAUSIBLE_DOMAIN="<your-plausible-domain>"

# The NuxtHub project key (found in the NuxtHub dashboard)
NUXT_HUB_PROJECT_KEY="<your-nuxthub-project-key>"

CLOUDINARY_CLOUDNAME="<your-cloudinary-cloudname>"

# A randomly generated API token for securing internal API routes
API_TOKEN="<string>"

# The public URL of the application including protocol
APP_URL="http://localhost:3000"
```

### Optional environment variables

```env
# Disable husky hooks
DISABLE_PRE_COMMIT_LINT=false
DISABLE_PRE_PUSH_TYPECHECK=false

# Enables Nuxt, Nitro and Wrangler debug mode
DEBUG=true

# Disable Plausible tracking globally
DISABLE_TRACKING=false

# Block non-SEO bots from accessing the site
BLOCK_NON_SEO_BOTS=false
BLOCK_AI_BOTS=false
```

### CI/CD Repository Secrets

There are also Repository Secrets that need to be configured for CI/CD deployments, which are:

```env
# The same API token as above for securing internal API routes. Used to invalidate cache after new deployments.
API_TOKEN="<string>"

# GitHub App credentials for semantic-release to create releases
RELEASE_APP_ID="<your-github-app-id>"
RELEASE_APP_PRIVATE_KEY="<your-github-app-private-key>"
```

## Static data

All data for this site is static and stored in the `/data` directory. This includes:

- `global.ts`: Global settings and metadata for the site
- `identity.ts`: Core identity information such as name, description, logo, contact details.
  Integrates some of the global data.
- `images.ts`: Some images used throughout the application
- `projects/`: A collection of project data files, each representing a kitchen project with details
  such as title, description, images, and specifications. Each file is used as a dynamic route under
  `/projecten/[project-name]`.

### Adding new projects

To add a new kitchen project to the site, create a new TypeScript file in the `/data/projects/`
directory. You can use this boilerplate as a starting point:

```ts
import defineProject from '../../shared/utils/defineProject'

export default defineProject({
  title: 'Project Title',
  // ... other project fields
})
```

The new file is automatically picked up by build config, api and page routes, making the project
available under `<APP_URL>/projecten/[filename-without-extension]`.

#### HRM support

When starting local development, chokidar will watch the `/data/projects/` directory for any new,
removed or changed files, and automatically regenerate the project index file.

Thus you don't need to restart the development server when adding or modifying project files.

> Looking back on this implementation, it would probably have been better to use
> [Nuxt Content](https://content.nuxt.com/) since that basically provides all this functionality out
> of the box. Anyway, at was a fun exercise to build it from scratch.

## Deployment

This project is deployed to Cloudflare Workers using NuxtHub. Deployment is fully automated through
the CI/CD pipeline for both `preview` and `production` environments.

### Preview Deployments

To start a preview deployment, you will need to create a pull request targeting the `main` branch.
Once the PR is created, the CI/CD pipeline will automatically build and deploy a preview version of
the site to NuxtHub. You can find the preview URL in the pipeline logs.

Note that preview deployments are only started if the code quality checks (linting, type checking)
pass successfully.

Preview deployments are ephemeral and will be redployed on any new commit, to any PR targeting
`main`, overriding the previous preview.

### Production Deployments

Production deployments are triggered automatically when pull requests are merged into the `main`
branch.

Before you can merge a pull request into `main`, status checks for code quality (linting, type
checking) and successful preview deployment must pass.

Upon merging, two things will happen automatically:

1. A new release will be created using semantic-release, which will bump the version number and
   generate a changelog entry based on the commit messages.
2. The CI/CD pipeline will build and deploy the new version of the site to the production
   environment on NuxtHub.

### Notifications

Both preview and production deployments will send notifications to the configured Slack channel upon
completion, indicating whether the deployment was successful or if it failed.

## Cloud services

This project uses multiple third party cloud services for hosting, deployment and analytics:

- **Cloudflare Workers**: for global edge hosting through NuxtHub
- **NuxtHub**: for CI/CD and edge deployment of Nuxt applications
- **Plausible Analytics**: for privacy-focused website analytics
- **Cloudinary**: for image hosting and optimization
- **GitHub**: for source code hosting and version control

## Troubleshooting

If you encounter issues during development or deployment, consider the following steps:

1. **Check Environment Variables**: Ensure all required environment variables are set correctly.
2. Run `pnpm lint` and `pnpm typecheck` to identify any code quality issues.
3. Create a fresh install with:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

**Note**: This license covers the source code only. Content, images, and branding materials may have
different licensing terms.
