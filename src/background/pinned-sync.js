import { TOOLBAR_ID } from "../platform/firefox-browser-api.js";
import { diffPinnedFolder } from "../core/pinned.js";

export async function syncPinnedFolder(api, state) {
  if (!state.pinnedFolderId) return state;

  let children;
  try {
    children = await api.getChildren(state.pinnedFolderId);
  } catch {
    const pinnedMap = { ...state.pinnedMap };
    for (const dupId of Object.values(pinnedMap)) {
      await api.removeBookmark(dupId);
    }
    return { ...state, pinnedMap: {} };
  }

  const folderOriginalIds = children.map((n) => n.id);
  const { toCreate, toRemove, order } = diffPinnedFolder(folderOriginalIds, state.pinnedMap);

  const pinnedMap = { ...state.pinnedMap };

  for (const originalId of toRemove) {
    await api.removeBookmark(pinnedMap[originalId]);
    delete pinnedMap[originalId];
  }

  for (const originalId of toCreate) {
    const original = await api.getBookmark(originalId);
    const duplicate = await api.createBookmark({
      parentId: TOOLBAR_ID,
      title: original.title,
      url: original.url,
    });
    pinnedMap[originalId] = duplicate.id;
  }

  for (let i = 0; i < order.length; i++) {
    await api.moveBookmark(pinnedMap[order[i]], { parentId: TOOLBAR_ID, index: i });
  }

  return { ...state, pinnedMap };
}