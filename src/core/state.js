export function createDefaultState(overrides = {}) {
  return {
    pinnedFolderId: null,
    separatorId: null,
    capacity: 10,
    dynamicMap: {},
    pinnedMap: {},
    ...overrides,
  };
}