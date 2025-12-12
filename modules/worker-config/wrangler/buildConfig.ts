import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../options'
import type {
    WranglerConfig,
} from './types'

import { appendEnviroment as append } from '../utils/environment'

import { ensureBinding } from './ensureBinding'
import { resolveCompatibilityDate } from '../utils/compatibilityDate'

interface BuildContext {
    nuxt: Nuxt
    options: ModuleOptions
    environment: string
}

export function buildWranglerConfig({
    nuxt,
    options,
    environment
}: BuildContext): WranglerConfig {
    const hub = nuxt.options.hub ?? {}

    const config: WranglerConfig = {
        $schema: 'node_modules/wrangler/config-schema.json',
        name: append(
            options.config.name,
            environment,
        ),
        compatibility_date: resolveCompatibilityDate(nuxt),
        main: './.output/server/index.mjs',

        assets: {
            directory: './.output/public/',
            binding: 'ASSETS',
        },
    }

    /**
     * Observability
     */
    if (options.config.observability) {
        config.observability = {
            logs: {
                enabled: true,
                ...(typeof options.config.observability === 'object'
                    ? options.config.observability
                    : {
                        head_sampling_rate: 1,
                        invocation_logs: true,
                    }),
            },
        }
    }

    /**
     * R2 (Blob)
     */
    if (hub.blob) {
        const bucket = {
            binding: 'BLOB',
            bucket_name: append(
                options.config.name,
                environment,
            ),
        }

        config.r2_buckets = ensureBinding(
            options.config.r2_buckets ?? [],
            'BLOB',
            bucket,
        )
    }

    /**
     * KV / Cache
     */
    const cache_namespace_id = options.resources?.kv?.cache_namespace_id ?? process.env.NUXT_HUB_CLOUDFLARE_CACHE_NAMESPACE_ID
    if (hub.cache && cache_namespace_id) {
        config.kv_namespaces = ensureBinding(
            options.config.kv_namespaces ?? [],
            'CACHE',
            {
                binding: 'CACHE',
                id: cache_namespace_id,
            },
        )
    }

    const kv_namespace_id = options.resources?.kv?.kv_namespace_id ?? process.env.NUXT_HUB_CLOUDFLARE_KV_NAMESPACE_ID
    if (hub.kv && kv_namespace_id) {
        config.kv_namespaces = ensureBinding(
            config.kv_namespaces ?? [],
            'KV',
            {
                binding: 'KV',
                id: kv_namespace_id
            },
        )
    }

    /**
     * D1
     */
    const database_id = options.resources?.db?.database_id ?? process.env.NUXT_HUB_CLOUDFLARE_DB_ID
    if (hub.db && hub.db === 'sqlite' && database_id) {
        config.d1_databases = ensureBinding(
            options.config.d1_databases ?? [],
            'DB',
            {
                binding: 'DB',
                database_id: database_id
            },
        )
    }

    /**
     * Vars
     */
    if (options.config.vars && Object.keys(options.config.vars).length > 0) {
        config.vars = options.config.vars
    }

    return config
}
