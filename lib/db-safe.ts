/** Run a database call that must never take a page down: bounded in time, and any failure (unreachable, bad URL, timeout) returns the fallback and logs once. */
export async function safeDb<T>(label: string, run: () => Promise<T>, fallback: T, ms = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      run(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} took longer than ${ms}ms`)), ms);
      }),
    ]);
  } catch (e) {
    console.warn(`[db] ${label} skipped: ${(e as Error).message.split("\n").filter(Boolean).pop() ?? "error"}`);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
