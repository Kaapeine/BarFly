/**
 * Serial async queue (a promise-chain mutex).
 *
 * Every enqueued task runs to completion before the next one starts, so
 * shared-state read-modify-write inside tasks is atomic and bursts of events
 * are processed in order instead of interleaving. JS is single-threaded, but
 * `await` yields control, so without this two handlers can read the same
 * `state`, both modify it, and one clobber the other (a lost update).
 */
export function createSerialQueue() {
  let tail = Promise.resolve();
  function enqueue(task) {
    const result = tail.then(() => task());
    // Swallow errors on the *chain* so one failed task doesn't break the next.
    // The caller still sees the real rejection via `result`.
    tail = result.then(
      () => {},
      () => {},
    );
    return result;
  }
  return { enqueue };
}
