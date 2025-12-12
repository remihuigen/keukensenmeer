import { DeepRequired } from './../../../shared/types/utils';
import type { NuxtOptions } from 'nuxt/schema';

export interface ModuleOptions {
	/**
	 * Whether the module is enabled
	 * @default true
	 */
	enabled?: boolean


	config: {
		/** The name for your worker. Make sure this is environment aware */
		name: string

		/** Whether to enabled observability log */
		observability?: boolean | {
			head_sampling_rate: number,
			invocation_logs: boolean,
		}

		r2_buckets?: {
			binding: string
			bucket_name: string
		}[]

		kv_namespaces?: {
			binding: string
			id: string
		}[]

		d1_databases?: {
			binding: string
			database_id: string
		}[]

		vars?: Record<string, string>

		env?: {
			[key: string]: {
				r2_buckets?: {
					binding: string
					bucket_name: string
				}[]

				kv_namespaces?: {
					binding: string
					id: string
				}[]

				d1_databases?: {
					binding: string
					database_id: string
				}[]
				vars?: Record<string, string>
			}
		}
	}


}

export type ResolvedModuleOptions = DeepRequired<ModuleOptions>