const MAX_WAIT_MS = 1500;

/** Milliseconds to wait before the next attempt: Retry-After (seconds) when the API sent one, otherwise a short growing back-off with jitter; never more than MAX_WAIT_MS. */
export function retryDelayMs(attempt: number, retryAfter: string | null, jitter = Math.random()): number {
  const secs = retryAfter != null && retryAfter.trim() !== "" ? Number(retryAfter) : NaN;
  const base = Number.isFinite(secs) && secs >= 0 ? secs * 1000 : 300 * 2 ** (attempt - 1) + jitter * 200;
  return Math.min(MAX_WAIT_MS, Math.round(base));
}

