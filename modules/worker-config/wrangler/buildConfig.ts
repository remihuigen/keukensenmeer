import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../options'
import type {
    WranglerConfig,
} from './types'

import { appendEnviroment as append } from '../utils/environment'

import { ensureBinding } from './ensureBinding'
import { resolveCompatibilityDate } from '../utils/compatibilityDate'
/**
 * Runtime context passed into `buildWranglerConfig`.
 * @property nuxt - The active Nuxt instance.
 * @property options - Module options provided to the Nuxt module.
 * @property environment - The deployment environment (e.g. "production", "staging").
 */
interface BuildContext {
    nuxt: Nuxt
    options: ModuleOptions
    environment: string
}

/**
 * Build a fully-generated Wrangler configuration based on Nuxt build output,
 * module options, and the target environment.
 *
 * This function merges user-defined config with inferred bindings:
 * - Appends environment-specific suffixes to names.
 * - Injects Cloudflare resources (R2, KV, D1) when enabled in Nuxt Hub.
 * - Ensures bindings never collide by using `ensureBinding`.
 * - Resolves compatibility dates automatically from Nuxt.
 * - Produces a valid `wrangler.json` structure for Cloudflare Workers deployments.
 *
 * @param ctx - The build context containing Nuxt, user options, and environment.
 * @returns A fully populated {@link WranglerConfig} ready to be written to wrangler.json.
 *
 * @example
 * ```ts
 * const config = buildWranglerConfig({
 *   nuxt,
 *   options,
 *   environment: "production"
 * })
 *
 * // Write to file:
 * await fs.writeFile("wrangler.json", JSON.stringify(config, null, 2))
 * ```
 */
export function buildWranglerConfig({
    nuxt,
    options,
    environment
}: BuildContext): WranglerConfig {
    const hub = nuxt.options.hub ?? {}

    console.log('worker name', options.config.name)
    console.log('environment', environment)
    console.log('append name', append(options.config.name, environment))

    const config: WranglerConfig = {
        $schema: 'node_modules/wrangler/config-schema.json',
        name: append(options.config.name, environment),
        compatibility_date: resolveCompatibilityDate(nuxt),
        main: './.output/server/index.mjs',
        assets: {
            directory: './.output/public/',
            binding: 'ASSETS'
        }
    }

    /**
     * Observability (logs)
     * Enables Cloudflare logging when configured via module options.
     * Defaults are applied when users enable observability without providing overrides.
     */
    if (options.config.observability) {
        config.observability = {
            logs: {
                enabled: true,
                ...(typeof options.config.observability === 'object'
                    ? options.config.observability
                    : {
                        head_sampling_rate: 1,
                        invocation_logs: true
                    })
            }
        }
    }

    /**
     * R2 Bucket binding
     * Added when Nuxt Hub `blob` is enabled. Binding name is always `"BLOB"`.
     * Bucket name is derived from app name + environment.
     */
    if (hub.blob) {
        const bucket = {
            binding: 'BLOB',
            bucket_name: append(options.config.name, environment)
        }

        config.r2_buckets = ensureBinding(
            options.config.r2_buckets ?? [],
            'BLOB',
            bucket
        )
    }

    /**
     * KV: Cache namespace
     * Uses either module resources config or environment variables.
     */
    const cache_namespace_id =
        options.resources?.kv?.cache_namespace_id ??
        process.env.NUXT_HUB_CLOUDFLARE_CACHE_NAMESPACE_ID
    console.log('cache_namespace_id', cache_namespace_id)
    if (hub.cache && cache_namespace_id) {
        config.kv_namespaces = ensureBinding(
            options.config.kv_namespaces ?? [],
            'CACHE',
            {
                binding: 'CACHE',
                id: cache_namespace_id
            }
        )
    }

    /**
     * KV: General purpose KV namespace
     * Added when hub.kv is enabled.
     */
    const kv_namespace_id =
        options.resources?.kv?.kv_namespace_id ??
        process.env.NUXT_HUB_CLOUDFLARE_KV_NAMESPACE_ID
    console.log('kv_namespace_id', kv_namespace_id)
    if (hub.kv && kv_namespace_id) {
        config.kv_namespaces = ensureBinding(
            config.kv_namespaces ?? [],
            'KV',
            {
                binding: 'KV',
                id: kv_namespace_id
            }
        )
    }

    /**
     * D1 Database
     * Only added when Nuxt Hub database is sqlite + correct resource IDs exist.
     */
    const database_id =
        options.resources?.db?.database_id ??
        process.env.NUXT_HUB_CLOUDFLARE_DB_ID
    console.log('database_id', database_id)
    if (hub.db && hub.db === 'sqlite' && database_id) {
        config.d1_databases = ensureBinding(
            options.config.d1_databases ?? [],
            'DB',
            {
                binding: 'DB',
                database_id
            }
        )
    }

    /**
     * Vars
     * Static runtime variables injected into the Worker on deployment.
     */
    if (options.config.vars && Object.keys(options.config.vars).length > 0) {
        config.vars = options.config.vars
    }

    return config
}
