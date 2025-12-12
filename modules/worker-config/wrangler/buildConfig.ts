import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../options'
import type {
    WranglerConfig,
    // WranglerEnvConfig,
} from './types'

import { ensureBinding } from './ensureBinding'
import { resolveCompatibilityDate } from '../utils/compatibilityDate'

interface BuildContext {
    nuxt: Nuxt
    options: ModuleOptions
}

export function buildWranglerConfig({
    nuxt,
    options,
}: BuildContext): WranglerConfig {
    const hub = nuxt.options.hub ?? {}

    // const previewEnv: WranglerEnvConfig =
    //     options.config.env?.preview ?? {}

    const config: WranglerConfig = {
        $schema: 'node_modules/wrangler/config-schema.json',
        name: options.config.name,
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
            bucket_name: options.config.name,
        }

        config.r2_buckets = ensureBinding(
            options.config.r2_buckets ?? [],
            'BLOB',
            bucket,
        )

        // previewEnv.r2_buckets = ensureBinding(
        //     previewEnv.r2_buckets ?? [],
        //     'BLOB',
        //     {
        //         binding: 'BLOB',
        //         bucket_name: `${options.config.name}-preview`, // Preview bucket
        //     },
        // )
    }

    /**
     * KV / Cache
     */
    if (hub.cache) {
        config.kv_namespaces = ensureBinding(
            options.config.kv_namespaces ?? [],
            'CACHE',
            {
                binding: 'CACHE',
                id: process.env
                    .NUXT_HUB_CLOUDFLARE_PROD_CACHE_NAMESPACE_ID!,
            },
        )

        // previewEnv.kv_namespaces = ensureBinding(
        //     previewEnv.kv_namespaces ?? [],
        //     'CACHE',
        //     {
        //         binding: 'CACHE',
        //         id: process.env
        //             .NUXT_HUB_CLOUDFLARE_PREVIEW_CACHE_NAMESPACE_ID!,
        //     },
        // )
    }

    if (hub.kv) {
        config.kv_namespaces = ensureBinding(
            config.kv_namespaces ?? [],
            'KV',
            {
                binding: 'KV',
                id: process.env
                    .NUXT_HUB_CLOUDFLARE_PROD_KV_NAMESPACE_ID!,
            },
        )

        // previewEnv.kv_namespaces = ensureBinding(
        //     previewEnv.kv_namespaces ?? [],
        //     'KV',
        //     {
        //         binding: 'KV',
        //         id: process.env
        //             .NUXT_HUB_CLOUDFLARE_PREVIEW_KV_NAMESPACE_ID!,
        //     },
        // )
    }

    /**
     * D1
     */
    if (hub.db && hub.db === 'sqlite') {
        config.d1_databases = ensureBinding(
            options.config.d1_databases ?? [],
            'DB',
            {
                binding: 'DB',
                database_id:
                    process.env.NUXT_HUB_CLOUDFLARE_PROD_DB_ID!,
            },
        )

        // previewEnv.d1_databases = ensureBinding(
        //     previewEnv.d1_databases ?? [],
        //     'DB',
        //     {
        //         binding: 'DB',
        //         database_id:
        //             process.env
        //                 .NUXT_HUB_CLOUDFLARE_PREVIEW_DB_ID!,
        //     },
        // )
    }

    /**
     * Vars
     */
    if (options.config.vars && Object.keys(options.config.vars).length > 0) {
        config.vars = options.config.vars
    }
    // if (Object.keys(previewEnv).length > 0) {
    //     config.env = { preview: previewEnv }
    // }

    return config
}
