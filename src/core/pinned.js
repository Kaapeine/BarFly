export function diffPinnedFolder(folderOriginalIds, pinnedMap) {
  const tracked = Object.keys(pinnedMap);
  const toCreate = folderOriginalIds.filter((id) => !tracked.includes(id));
  const toRemove = tracked.filter((id) => !folderOriginalIds.includes(id));
  return { toCreate, toRemove, order: [...folderOriginalIds] };
}