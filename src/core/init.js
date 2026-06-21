import { TOOLBAR_ID } from "../platform/browser-api.js";

/**
 * Resolves the initial BarFly state on every background script load.
 *
 * Handles 3 cases based on whether saved state and the toolbar separator exist.
 * Case 4 (no state, no separator) is not handled here — it means setup is
 * incomplete, and the background script enters setup mode instead.
 *
 * | # | State | Separator | Action |
 * |---|-------|-----------|--------|
 * | 1 | ✅    | ✅        | Return saved state as-is |
 * | 2 | ✅    | ❌        | Recreate separator, return state with new id |
 * | 3 | ❌    | ✅        | Reconstruct fresh state from existing separator |
 *
 * @param {object} api - Browser API adapter
 * @returns {Promise<{state: object}>}
 */
export async function resolveInitState(api) {
  const toolbarChildren = await api.getChildren(TOOLBAR_ID);
  const existingSeparator = toolbarChildren.find((c) => c.type === 'separator');
  const savedState = await api.getState();

  if (savedState && existingSeparator) {
    // Case 1: Normal restart
    return { state: savedState };
  }

  if (savedState && !existingSeparator) {
    // Case 2: Separator was deleted — recreate at index 0
    const separator = await api.createBookmark({
      parentId: TOOLBAR_ID,
      index: 0,
      type: 'separator',
    });
    try {
      await api.createNotification({
        type: 'basic',
        title: 'BarFly',
        message:
          'The bookmarks toolbar separator was missing and has been recreated. Drag it to your preferred position.',
      });
    } catch {
      // notifications not supported
    }
    return { state: { ...savedState, separatorId: separator.id } };
  }

  if (!savedState && existingSeparator) {
    // Case 3: Storage cleared — reconstruct from toolbar
    const state = {
      separatorId: existingSeparator.id,
      capacity: 10,
      entries: [],
    };
    await api.setState(state);
    return { state };
  }

  // Case 4: No state, no separator — setup incomplete.
  // The background handles this by entering setup mode.
  return { state: null };
}
