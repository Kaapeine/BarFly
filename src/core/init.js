import { TOOLBAR_ID } from "../platform/browser-api.js";

/**
 * Resolves the initial BarFly state on every background script load.
 *
 * Handles cases based on whether saved state and the toolbar separator exist.
 * `state` and the `setupComplete` flag are always cleared together (see
 * clearStorage), so this is only ever called once setupComplete is true —
 * meaning state should exist. If it doesn't, setup is treated as incomplete
 * and the background script re-enters setup mode, regardless of whether a
 * leftover separator is still on the toolbar.
 *
 * | # | State | Separator | Action |
 * |---|-------|-----------|--------|
 * | 1 | ✅    | ✅        | Return saved state as-is |
 * | 2 | ✅    | ❌        | Recreate separator, return state with new id |
 * | 3 | ❌    | either    | Return null — setup is incomplete |
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
      api.showAlert(
        'The bookmarks toolbar separator was missing and has been recreated. Drag it to your preferred position.',
      );
    } catch {
      // alerts not supported
    }
    return { state: { ...savedState, separatorId: separator.id } };
  }

  // Case 3: No state — setup incomplete.
  // The background handles this by entering setup mode.
  return { state: null };
}
