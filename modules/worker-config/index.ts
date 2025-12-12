import { defineNuxtModule, useLogger } from '@nuxt/kit'
import type { ModuleOptions, ResolvedModuleOptions } from './types/options'
import { moduleSetup } from '../../shared/utils/modules'
import type { DeepPartial } from '@nuxt/ui'
import defu from 'defu'
import fs from 'node:fs/promises'

const MODULE_NAME = '@remihuigen/worker-config'
const MODULE_KEY = 'workerConfig'
const LOG_SCOPE = MODULE_NAME.split('/').pop()!

const DEFAULTS = {
    enabled: true
} satisfies DeepPartial<ModuleOptions>

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: MODULE_NAME,
        configKey: MODULE_KEY,
        compatibility: {
            nuxt: '^3.0.0 || ^4.0.0',
        },
        defaults: DEFAULTS,
    },
    setup(userOptions, nuxt) {
        const log = useLogger(LOG_SCOPE)

        const { start, end, isEnabled, options } = moduleSetup<ResolvedModuleOptions>(
            MODULE_NAME,
            MODULE_KEY,
            userOptions,
            DEFAULTS,
            log,
        )

        start()

        if (!isEnabled()) return

        // First update nitro config
        nuxt.options.nitro.preset = 'cloudflare_module',
            nuxt.options.nitro.cloudflare = defu(
                nuxt.options.nitro.cloudflare ?? {},
                {
                    deployConfig: true,
                    nodeCompat: true
                }
            )

        const hubConfig = nuxt.options.hub ?? {}

        // Setup env specific config
        // TODO add strong typing
        const env: Record<'preview', Record<string, any>> = {
            preview: {
                vars: options.config.env?.preview?.vars ?? {},
            }
        }

        const vars: Record<string, string> = options.config.env?.production?.vars ?? {}

        // TODO add strong typing
        const workerConfig: Record<string, any> = {
            "$schema": "node_modules/wrangler/config-schema.json",
            name: options.config.name,
            compatibility_date: typeof nuxt.options.compatibilityDate === 'object' && 'default' in nuxt.options.compatibilityDate ? nuxt.options.compatibilityDate.default : nuxt.options.compatibilityDate.toString() ?? "2025-12-12",
            // Should check outputDir, but for now hardcoding
            main: "./.output/server/index.mjs",
            assets: {
                directory: "./.output/public/",
                binding: "ASSETS"
            },
        }

        if (options.config.observability) {
            if (typeof options.config.observability === 'object') {
                workerConfig.observability = {
                    logs: {
                        enabled: true,
                        ...options.config.observability
                    }
                }
            } else {
                workerConfig.observability = {
                    logs: {
                        enabled: true,
                        head_sampling_rate: 1,
                        invocation_logs: true,
                    }
                }
            }
        }

        // Automatically add Blob bucket if feature is enabled and not already present
        const buckets = options.config.r2_buckets ?? []
        const previewBuckets = env.preview.r2_buckets ?? []
        if (hubConfig.blob && !buckets.find(b => b.binding === 'BLOB')) {
            buckets.push({
                binding: 'BLOB',
                bucket_name: options.config.name, // Use worker name as bucket name, which is Nuxthub convention
            })
        }
        if (hubConfig.blob && !previewBuckets.find((b: any) => b.binding === 'BLOB')) {
            previewBuckets.push({
                binding: 'BLOB',
                bucket_name: options.config.name, // Use worker name as bucket name, which is Nuxthub convention
            })
        }
        if (buckets.length > 0) {
            workerConfig.r2_buckets = buckets
        }
        if (previewBuckets.length > 0) {
            env.preview.r2_buckets = previewBuckets
        }

        // Automatically add CACHE and KV namespace if caching is enabled and not already present
        const kv_namespaces = options.config.kv_namespaces ?? []
        const preview_kv_namespaces = env.preview.kv_namespaces ?? []
        if (hubConfig.cache && !kv_namespaces.find(b => b.binding === 'CACHE')) {
            kv_namespaces.push({
                binding: 'CACHE',
                id: process.env.NUXT_HUB_CLOUDFLARE_PROD_CACHE_NAMESPACE_ID!,
            })
        }
        if (hubConfig.cache && !preview_kv_namespaces.find((b: any) => b.binding === 'CACHE')) {
            preview_kv_namespaces.push({
                binding: 'CACHE',
                id: process.env.NUXT_HUB_CLOUDFLARE_PREVIEW_CACHE_NAMESPACE_ID!,
            })
        }
        if (hubConfig.kv && !kv_namespaces.find(b => b.binding === 'KV')) {
            kv_namespaces.push({
                binding: 'KV',
                id: process.env.NUXT_HUB_CLOUDFLARE_PROD_KV_NAMESPACE_ID!,
            })
        }
        if (hubConfig.kv && !preview_kv_namespaces.find((b: any) => b.binding === 'KV')) {
            preview_kv_namespaces.push({
                binding: 'KV',
                id: process.env.NUXT_HUB_CLOUDFLARE_PREVIEW_KV_NAMESPACE_ID!,
            })
        }
        if (kv_namespaces.length > 0) {
            workerConfig.kv_namespaces = kv_namespaces
        }
        if (preview_kv_namespaces.length > 0) {
            env.preview.kv_namespaces = preview_kv_namespaces
        }

        const d1_databases = options.config.d1_databases ?? []
        const preview_d1_databases = env.preview.d1_databases ?? []
        if (hubConfig.database && !d1_databases.find(b => b.binding === 'DB')) {
            d1_databases.push({
                binding: 'DB',
                database_id: process.env.NUXT_HUB_CLOUDFLARE_PROD_DB_ID!,
            })
        }
        if (hubConfig.database && !preview_d1_databases.find((b: any) => b.binding === 'DB')) {
            preview_d1_databases.push({
                binding: 'DB',
                database_id: process.env.NUXT_HUB_CLOUDFLARE_PREVIEW_DB_ID!,
            })
        }
        if (d1_databases.length > 0) {
            workerConfig.d1_databases = d1_databases
        }
        if (preview_d1_databases.length > 0) {
            env.preview.d1_databases = preview_d1_databases
        }

        if (Object.keys(vars).length > 0) {
            workerConfig.vars = vars
        }

        const { vars: previewVars, ...rest } = env.preview


        if (Object.keys(rest).length > 0) {
            workerConfig.env = env

            if (Object.keys(previewVars).length === 0) {
                delete workerConfig.env.preview.vars
            }
        }

        // Write generated wrangler.jsonc config to project root
        nuxt.hook('nitro:build:before', async () => {
            const wranglerPath = nuxt.options.rootDir + '/wrangler.jsonc'
            log.info(`Writing generated wrangler config to ${wranglerPath}`)
            await fs.writeFile(wranglerPath, JSON.stringify(workerConfig, null, 2))
        })

        end()
    },
})
