export interface WranglerR2Bucket {
    binding: string
    bucket_name: string
}

export interface WranglerKVNamespace {
    binding: string
    id: string
}

export interface WranglerD1Database {
    binding: string
    database_id: string
}

export interface WranglerEnvConfig {
    r2_buckets?: WranglerR2Bucket[]
    kv_namespaces?: WranglerKVNamespace[]
    d1_databases?: WranglerD1Database[]
    vars?: Record<string, string>
}

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
