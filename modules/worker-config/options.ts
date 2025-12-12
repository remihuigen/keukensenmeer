import type { DeepRequired } from '../../shared/types/utils'
import type { WranglerEnvConfig } from './wrangler/types'

export interface ModuleOptions {
	enabled?: boolean
	/** 
	 * The current enviroment we are generated config for.
	 * If a value is not provided, the module will look for runtimeConfig.public.mode.value
	 */
	environment?: string

	/**
	 * ID references of core Cloudflare Worker resources to bind
	 * to the Worker at runtime.
	 * 
	 * These are required when using R2, KV or D1 in environments
	 * other than development.
	 * 
	 * If not provided, the module will look for environment variables
	 * with the following names:
	 * 
	 * - NUXT_HUB_CLOUDFLARE_CACHE_NAMESPACE_ID
	 * - NUXT_HUB_CLOUDFLARE_KV_NAMESPACE_ID
	 * - NUXT_HUB_CLOUDFLARE_DB_ID
	 */
	resources?: {
		kv?: {
			cache_namespace_id: string
			kv_namespace_id: string
		}
		db?: {
			database_id: string
		}
	}

	config: {
		name: string

		observability?:
		| boolean
		| {
			head_sampling_rate: number
			invocation_logs: boolean
		}

		r2_buckets?: WranglerEnvConfig['r2_buckets']
		kv_namespaces?: WranglerEnvConfig['kv_namespaces']
		d1_databases?: WranglerEnvConfig['d1_databases']

		vars?: Record<string, string>

		// TODO support additional bindings
	}
}


/** Module options but with all keys resolved */
export type ResolvedModuleOptions = DeepRequired<ModuleOptions>
