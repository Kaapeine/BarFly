import { TOOLBAR_ID, OTHER_ID } from "../platform/firefox-browser-api.js";
import { syncPinnedFolder } from "./pinned-sync.js";
import { addDynamic } from "../core/lru.js";

export async function promoteToPinned(api, state, originalId) {
  const original = await api.getBookmark(originalId);
  await api.createBookmark({
    parentId: state.pinnedFolderId,
    title: original.title,
    url: original.url,
  });

  const dynamicMap = { ...state.dynamicMap };
  const oldDuplicateId = dynamicMap[originalId];
  if (oldDuplicateId) {
    await api.removeBookmark(oldDuplicateId);
    delete dynamicMap[originalId];
  }

  return syncPinnedFolder(api, { ...state, dynamicMap });
}

export async function demoteToDynamic(api, state, originalId) {
  const duplicateId = state.pinnedMap[originalId];
  const pinnedMap = { ...state.pinnedMap };
  delete pinnedMap[originalId];

  await api.moveBookmark(originalId, { parentId: OTHER_ID });
  if (duplicateId) await api.removeBookmark(duplicateId);

  const children = await api.getChildren(TOOLBAR_ID);
  const separatorIndex = children.findIndex((c) => c.id === state.separatorId);
  const dynamicOriginalIds = Object.keys(state.dynamicMap);
  const { order, evicted } = addDynamic(dynamicOriginalIds, originalId, state.capacity);

  const original = await api.getBookmark(originalId);
  const newDuplicate = await api.createBookmark({
    parentId: TOOLBAR_ID,
    index: separatorIndex + 1,
    title: original.title,
    url: original.url,
  });

  const dynamicMap = { ...state.dynamicMap, [originalId]: newDuplicate.id };
  for (const evictedId of evicted) {
    await api.removeBookmark(dynamicMap[evictedId]);
    delete dynamicMap[evictedId];
  }
  for (let i = 0; i < order.length; i++) {
    await api.moveBookmark(dynamicMap[order[i]], { parentId: TOOLBAR_ID, index: separatorIndex + 1 + i });
  }

  return { ...state, pinnedMap, dynamicMap };
}
