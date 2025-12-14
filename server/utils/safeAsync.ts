/**
 * Executes an async function safely and returns a structured result.
 *
 * @template TArgs Arguments accepted by the async callback.
 * @template TResult The resolved return type of the async callback.
 *
 * @param asyncFunc - The async callback to execute.
 * @param args - Optional arguments forwarded to the callback.
 *
 * @returns An object containing either a result or an error.
 */
export async function safeAsync<TArgs extends unknown[], TResult>(
  asyncFunc: (...args: TArgs) => Promise<TResult>,
  ...args: TArgs
): Promise<
  | { result: TResult; error: null }
  | { result: null; error: unknown }
> {
  try {
    // spread the args into the callback — simple, dumb, effective
    const result = await asyncFunc(...args);
    return { result, error: null };
  } catch (error: unknown) {
    // whoever threw this probably hates you, but we catch anyway
    return { result: null, error };
  }
}
