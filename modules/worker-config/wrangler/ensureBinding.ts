export function ensureBinding<T extends { binding: string }>(
    list: T[],
    binding: string,
    value: T,
): T[] {
    if (list.some(item => item.binding === binding)) {
        return list
    }

    return [...list, value]
}
