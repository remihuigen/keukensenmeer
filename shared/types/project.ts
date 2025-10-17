export interface ProjectInput {
    title: string
}

export interface Project extends ProjectInput {
    slug: string
}

export interface ProjectOverviewItem {
    title: string
    slug: string
}
