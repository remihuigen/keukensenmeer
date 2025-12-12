import type { DeepRequired } from '../../shared/types/utils'
import type { WranglerEnvConfig } from './wrangler/types'

export interface ModuleOptions {
	enabled?: boolean

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
		env?: Record<string, WranglerEnvConfig>
	}
}

export type ResolvedModuleOptions = DeepRequired<ModuleOptions>
