import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import fs from 'node:fs/promises'
import type { DeepPartial } from '../../shared/types/utils'

import { moduleSetup } from '../../shared/utils/modules'
import type { ModuleOptions } from './options'
import { buildWranglerConfig } from './wrangler/buildConfig'

const MODULE_NAME = '@remihuigen/worker-config'
const MODULE_KEY = 'workerConfig'
const LOG_SCOPE = MODULE_NAME.split('/').pop()!

const DEFAULTS = {
    enabled: true,
} satisfies DeepPartial<ModuleOptions>

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: MODULE_NAME,
        configKey: MODULE_KEY,
        compatibility: { nuxt: '^3.0.0 || ^4.0.0' },
        defaults: DEFAULTS,
    },

    setup(userOptions, nuxt) {
        const log = useLogger(LOG_SCOPE)

        const { start, end, isEnabled, options, checkOption } =
            moduleSetup<ModuleOptions>(
                MODULE_NAME,
                MODULE_KEY,
                userOptions,
                DEFAULTS,
                log,
            )

        start()

        if (!isEnabled()) {
            return
        }

        const { mode } = nuxt.options.runtimeConfig.public
        const environment = options.environment ?? mode.value

        if (!environment) {
            log.warn('Could not detect the current environment. Worker config module will not generate wrangler config. Please set the "environment" option to override this.')
            return
        }

        if (nuxt.options.dev && mode.isDev) {
            log.info('Development environment detected. Worker config module will not generate wrangler config.')
            return
        }

        // Validate required options
        checkOption({ key: 'config.name', message: 'Worker name is required', required: true })


        /** 
         * Set Nitro Cloudflare preset in environments other than dev
         * In dev we let Nuxthub resort to default (e.g. file system)
         */
        nuxt.options.nitro.preset = 'cloudflare_module'

        // Ensure Cloudflare specific Nitro options are set
        nuxt.options.nitro.cloudflare = defu(
            nuxt.options.nitro.cloudflare ?? {},
            {
                deployConfig: true,
                nodeCompat: true,
            },
        )

        /** Generate the wrangler.jsonc file */
        nuxt.hook('nitro:build:before', async () => {
            const wranglerConfig = buildWranglerConfig({
                nuxt,
                options,
                environment
            })

            if (nuxt.options.runtimeConfig.public.mode.isDebug) {
                log.info('Generated Wrangler Config')
                log.info(JSON.stringify(wranglerConfig, null, 2))
            }

            const path = `${nuxt.options.rootDir}/wrangler.jsonc`
            log.info(`Writing generated wrangler config to ${path}`)

            await fs.writeFile(path, JSON.stringify(wranglerConfig, null, 2))
        })

        end()
    },
})
