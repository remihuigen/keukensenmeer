export default defineAppConfig({
    ui: {
        colors: {
            primary: 'primary',
            secondary: 'secondary',
            info: 'blue',
            success: 'green',
            warning: 'orange',
            error: 'red',
            neutral: 'gray',
        },
        icons: {
            light: 'heroicons:sun-16-solid',
            dark: 'heroicons:moon-16-solid',
            arrowLeft: 'heroicons:arrow-left',
            arrowRight: 'heroicons:rrow-right',
            check: 'heroicons:check',
            chevronDoubleLeft: 'heroicons:chevron-double-left',
            chevronDoubleRight: 'heroicons:chevron-double-right',
            chevronDown: 'heroicons:chevron-down',
            chevronLeft: 'heroicons:chevron-left',
            chevronRight: 'heroicons:chevron-right',
            chevronUp: 'heroicons:chevron-up',
            close: 'heroicons:x-mark',
            ellipsis: 'heroicons:ellipsis-horizontal',
            external: 'heroicons:arrow-up-right',
            folder: 'heroicons:folder',
            folderOpen: 'heroicons:folder-open',
            loading: 'heroicons:arrow-path',
            minus: 'heroicons:minus',
            plus: 'heroicons:plus',
            search: 'heroicons:magnifying-glass'
        },
        formField: {
            slots: {
                wrapper: 'space-y-1',
                label: 'font-bold uppercase',
                description: 'text-sm text-muted mb-2',
            }
        },
        fileUpload: {
            slots: { base: 'cursor-pointer' }
        },
        button: {
            slots: {
                base: 'rounded-none font-bold uppercase cursor-pointer',
                label: 'uppercase'
            },
            variants: {
                color: {
                    primary: 'text-white',
                },
                size: {
                    xl: {
                        base: 'px-6 py-4 text-sm',
                    }
                }
            },
            compoundVariants: [
                {
                    color: 'primary',
                    variant: 'solid',
                    class: 'text-white'
                },
                {
                    color: 'primary',
                    variant: 'outline',
                    class: 'text-white'
                },
                {
                    color: 'primary',
                    variant: 'soft',
                    class: 'text-secondary-100'
                },
                {
                    color: 'primary',
                    variant: 'subtle',
                    class: 'text-secondary-800'
                },
                {
                    color: 'primary',
                    variant: 'ghost',
                    class: 'text-white'
                },
                {
                    color: 'primary',
                    variant: 'link',
                    class: 'text-primary-400'
                },
                {
                    color: 'secondary',
                    variant: 'solid',
                    class: 'text-white'
                }
            ]
        },
        navigationMenu: {
            slots: {
                list: 'gap-6',
                link: 'uppercase before:rounded-none '
            },
            compoundVariants: [
                {
                    disabled: false,
                    active: false,
                    variant: 'pill',
                    class: {
                        link: [
                            'hover:before:bg-neutral-100/10',
                        ]
                    }
                },
                {
                    disabled: false,
                    active: true,
                    variant: 'pill',
                    class: {
                        link: [
                            'before:bg-secondary-200/10 hover:before:bg-neutral-100/10',
                        ]
                    }
                },
            ]
        }
    }
})