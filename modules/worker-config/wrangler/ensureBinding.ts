/**
 * Ensure that a binding is present in the list. If not, add it.
 * @param list - existing list of bindings
 * @param binding - binding name to ensure
 * @param value - binding value to add if not present
 * @returns updated list of bindings
 */
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
