import { TOOLBAR_ID } from "../platform/browser-api.js";

/**
 * Installs BarFly on the toolbar.
 *
 * Called only by the setup wizard — creates the separator and saves initial
 * state. Archiving existing bookmarks is handled separately by the wizard
 * before calling this function. If a separator already exists on the
 * toolbar (e.g. the user chose "Leave as-is" while recovering lost state),
 * it's reused instead of creating a second one.
 *
 * @param {object} api - Browser API adapter
 * @param {number} [capacity=10] - Initial dynamic section capacity
 * @returns {Promise<object>} The saved state
 */
export async function runInstall(api, capacity = 10) {
  const toolbarChildren = await api.getChildren(TOOLBAR_ID);
  const existingSeparator = toolbarChildren.find((c) => c.type === "separator");
  const separator = existingSeparator
    ?? (await api.createBookmark({
      parentId: TOOLBAR_ID,
      index: 0,
      type: "separator",
    }));

  const state = { separatorId: separator.id, capacity, entries: [] };
  await api.setState(state);
  return state;
}
