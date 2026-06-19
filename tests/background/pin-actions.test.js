import { describe, it, expect } from "vitest";
import { createFakeBrowserApi } from "../platform/fake-browser-api.js";
import { TOOLBAR_ID, OTHER_ID } from "../../src/platform/firefox-browser-api.js";
import { createDefaultState } from "../../src/core/state.js";
import { promoteToPinned, demoteToDynamic } from "../../src/background/pin-actions.js";

describe("promoteToPinned", () => {
  it("copies the original into the pinned folder and removes the dynamic duplicate", async () => {
    const api = createFakeBrowserApi();
    const separator = await api.createBookmark({ parentId: TOOLBAR_ID, type: "separator" });
    const original = await api.createBookmark({ parentId: "folder", title: "A", url: "https://a.test" });
    const dup = await api.createBookmark({ parentId: TOOLBAR_ID, title: "A", url: "https://a.test" });
    const state = createDefaultState({
      separatorId: separator.id,
      pinnedFolderId: "pinned-folder",
      dynamicMap: { [original.id]: dup.id },
    });

    const next = await promoteToPinned(api, state, original.id);

    expect(next.dynamicMap).toEqual({});
    expect(Object.keys(next.pinnedMap)).toHaveLength(1);
    const pinnedFolderChildren = await api.getChildren("pinned-folder");
    expect(pinnedFolderChildren).toHaveLength(1);
    expect(pinnedFolderChildren[0].url).toBe("https://a.test");
    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren.filter((n) => n.url).map((n) => n.url)).toEqual(["https://a.test"]);
  });
});

describe("demoteToDynamic", () => {
  it("relocates the pinned original to Other Bookmarks and adds a fresh dynamic duplicate", async () => {
    const api = createFakeBrowserApi();
    const separator = await api.createBookmark({ parentId: TOOLBAR_ID, type: "separator" });
    const original = await api.createBookmark({ parentId: "pinned-folder", title: "A", url: "https://a.test" });
    let state = createDefaultState({ separatorId: separator.id, pinnedFolderId: "pinned-folder", capacity: 5 });
    const dup = await api.createBookmark({ parentId: TOOLBAR_ID, index: 0, title: "A", url: "https://a.test" });
    state = { ...state, pinnedMap: { [original.id]: dup.id } };

    const next = await demoteToDynamic(api, state, original.id);

    expect(next.pinnedMap).toEqual({});
    expect(Object.keys(next.dynamicMap)).toEqual([original.id]);
    const otherChildren = await api.getChildren(OTHER_ID);
    expect(otherChildren.map((n) => n.id)).toEqual([original.id]);
    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren.filter((n) => n.url).map((n) => n.url)).toEqual(["https://a.test"]);
  });
});
