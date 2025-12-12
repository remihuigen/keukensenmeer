import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import fs from 'node:fs/promises'
import type { DeepPartial } from '../../shared/types/utils'

import { moduleSetup } from '../../shared/utils/modules'
import type { ModuleOptions, ResolvedModuleOptions } from './options'
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

        const { start, end, isEnabled, options } =
            moduleSetup<ResolvedModuleOptions>(
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

        /** Nitro Cloudflare preset */
        nuxt.options.nitro.preset = 'cloudflare_module'
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
            })

            const path = `${nuxt.options.rootDir}/wrangler.jsonc`
            log.info(`Writing generated wrangler config to ${path}`)

            await fs.writeFile(path, JSON.stringify(wranglerConfig, null, 2))
        })

        end()
    },
})
