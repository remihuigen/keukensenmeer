export interface ModuleOptions {
	/**
	 * Whether the module is enabled
	 * @default true
	 */
	enabled?: boolean

	/**
	 * Directory (relative to project root) that contains project files
	 * @default 'data/projects'
	 */
	projectsDir?: string

	github?: {
		owner?: string
		repo?: string
		defaultBranch?: string
		branchPrefix?: string
	}

	previewBaseUrl?: string
}
