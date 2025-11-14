# Conversational CMS Module

This local Nuxt module exposes authenticated CMS endpoints that the custom GPT can call.
The module is responsible for:

- Validating incoming project payloads with Zod
- Rendering project files using the existing `defineProject` helper
- Re-generating the aggregated `data/projects/index.ts`
- Uploading client images to Cloudinary via OpenAI file IDs
- Creating GitHub branches, commits, and pull-requests via the Release app credentials

## Environment variables

The module reads the following secrets at runtime:

| Variable | Purpose |
| --- | --- |
| `CMS_AUTH_TOKEN` | Shared secret required in the `x-cms-auth` header |
| `GITHUB_RELEASE_APP_ID` / `GITHUB_RELEASE_APP_CLIENT_ID` / `GITHUB_RELEASE_APP_CLIENT_SECRET` / `GITHUB_RELEASE_APP_PRIVATE_KEY` | GitHub App credentials used to create PRs |
| `CLOUDINARY_CLOUDNAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload config |
| `OPENAI_API_KEY` | Used to download user-uploaded images from OpenAI's Files API |

## Available endpoints

All routes live under `/api/cms/*` and require the `x-cms-auth` token.

| Route | Method | Description |
| --- | --- | --- |
| `/api/cms/projects` | `GET` | Returns a compact overview of all projects |
| `/api/cms/projects/:slug` | `GET` | Returns the full project payload (including unpublished) |
| `/api/cms/projects/:slug/update` | `POST` | Accepts a full `ProjectInput` object and opens a PR with the changes |
| `/api/cms/projects/create` | `POST` | Creates a new project file, updates the index, and opens a PR |
| `/api/cms/projects/:slug/archive` | `POST` | Marks a project as archived and opens a PR |
| `/api/cms/images/upload` | `POST` | Downloads an OpenAI file, uploads it to Cloudinary, and returns orientation data |

Each mutation route follows the same flow:

1. Authenticate request
2. Validate payload with Zod
3. Normalize timestamps
4. Render deterministic project/index files
5. Use Octokit to create a branch + PR against `main`
6. Respond with branch + PR URL so GPT can inform the client
