/**
 * R2 bucket binding configuration for Wrangler.
 * @property binding - The variable name exposed to the Worker.
 * @property bucket_name - The Cloudflare R2 bucket to bind.
 */
export interface WranglerR2Bucket {
    binding: string
    bucket_name: string
}

/**
 * KV namespace binding configuration for Wrangler.
 * @property binding - The variable name exposed to the Worker.
 * @property id - The KV namespace ID.
 */
export interface WranglerKVNamespace {
    binding: string
    id: string
}

/**
 * D1 database binding configuration for Wrangler.
 * @property binding - The variable name exposed to the Worker.
 * @property database_id - The Cloudflare D1 database ID.
 */
export interface WranglerD1Database {
    binding: string
    database_id: string
}

/**
 * Environment-specific overrides for Wrangler configuration.
 * @property r2_buckets - Optional R2 bindings scoped to this environment.
 * @property kv_namespaces - Optional KV bindings scoped to this environment.
 * @property d1_databases - Optional D1 bindings scoped to this environment.
 * @property vars - Optional variables injected into the Worker runtime.
 */
export interface WranglerEnvConfig {
    r2_buckets?: WranglerR2Bucket[]
    kv_namespaces?: WranglerKVNamespace[]
    d1_databases?: WranglerD1Database[]
    vars?: Record<string, string>
}

/**
 * Complete Wrangler configuration definition (wrangler.json).
 *
 * @property $schema - JSON Schema URL for Wrangler config validation.
 * @property name - The Cloudflare Worker name.
 * @property compatibility_date - Minimum date for runtime compatibility.
 * @property main - The entrypoint file (e.g. `index.js`).
 *
 * @property assets - Static asset binding & directory configuration.
 * @property assets.directory - Local directory served as assets.
 * @property assets.binding - Binding name exposed inside Worker code.
 *
 * @property observability - Optional Cloudflare observability settings.
 * @property observability.logs.enabled - Whether logs are enabled.
 * @property observability.logs.head_sampling_rate - Optional sampling rate for request logs.
 * @property observability.logs.invocation_logs - Whether invocation logs are enabled.
 *
 * @property r2_buckets - Global R2 bucket bindings.
 * @property kv_namespaces - Global KV bindings.
 * @property d1_databases - Global D1 bindings.
 * @property vars - Global runtime variables available to the Worker.
 *
 * @property env - Environment-specific overrides (e.g. `production`, `staging`).
 * The key is the environment name, and each value is a {@link WranglerEnvConfig}.
 *
 * @example
 * ```ts
 * const config: WranglerConfig = {
 *   $schema: "https://schema.cloudflare.com/wrangler.json",
 *   name: "my-worker",
 *   compatibility_date: "2025-01-01",
 *   main: "src/index.ts",
 *   assets: {
 *     directory: "./public",
 *     binding: "ASSETS"
 *   },
 *   r2_buckets: [{ binding: "FILES", bucket_name: "my-files" }],
 *   env: {
 *     production: {
 *       vars: { NODE_ENV: "production" }
 *     }
 *   }
 * }
 * ```
 */
export interface WranglerConfig {
    $schema: string
    name: string
    compatibility_date: string
    main: string

    assets: {
        directory: string
        binding: string
    }

    observability?: {
        logs: {
            enabled: boolean
            head_sampling_rate?: number
            invocation_logs?: boolean
        }
    }

    r2_buckets?: WranglerR2Bucket[]
    kv_namespaces?: WranglerKVNamespace[]
    d1_databases?: WranglerD1Database[]
    vars?: Record<string, string>
    env?: Record<string, WranglerEnvConfig>
}
