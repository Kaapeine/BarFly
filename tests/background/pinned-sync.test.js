import { describe, it, expect } from "vitest";
import { createFakeBrowserApi } from "../platform/fake-browser-api.js";
import { TOOLBAR_ID } from "../../src/platform/firefox-browser-api.js";
import { createDefaultState } from "../../src/core/state.js";
import { syncPinnedFolder } from "../../src/background/pinned-sync.js";

describe("syncPinnedFolder", () => {
  it("does nothing if no pinned folder is configured", async () => {
    const api = createFakeBrowserApi();
    const state = createDefaultState();

    const next = await syncPinnedFolder(api, state);

    expect(next).toEqual(state);
    expect(await api.getChildren(TOOLBAR_ID)).toEqual([]);
  });

  it("creates toolbar duplicates for everything in the pinned folder, in order", async () => {
    const api = createFakeBrowserApi();
    const a = await api.createBookmark({ parentId: "pinned-folder", title: "A", url: "https://a.test" });
    const b = await api.createBookmark({ parentId: "pinned-folder", title: "B", url: "https://b.test" });
    const state = createDefaultState({ pinnedFolderId: "pinned-folder" });

    const next = await syncPinnedFolder(api, state);

    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren.map((n) => n.title)).toEqual(["A", "B"]);
    expect(Object.keys(next.pinnedMap)).toEqual([a.id, b.id]);
  });

  it("removes the duplicate when an item is removed from the pinned folder", async () => {
    const api = createFakeBrowserApi();
    const a = await api.createBookmark({ parentId: "pinned-folder", title: "A", url: "https://a.test" });
    let state = createDefaultState({ pinnedFolderId: "pinned-folder" });
    state = await syncPinnedFolder(api, state);
    await api.removeBookmark(a.id);

    const next = await syncPinnedFolder(api, state);

    expect(next.pinnedMap).toEqual({});
    expect(await api.getChildren(TOOLBAR_ID)).toEqual([]);
  });

  it("reorders toolbar duplicates when the pinned folder is reordered", async () => {
    const api = createFakeBrowserApi();
    const a = await api.createBookmark({ parentId: "pinned-folder", title: "A", url: "https://a.test" });
    const b = await api.createBookmark({ parentId: "pinned-folder", title: "B", url: "https://b.test" });
    let state = createDefaultState({ pinnedFolderId: "pinned-folder" });
    state = await syncPinnedFolder(api, state);
    await api.moveBookmark(b.id, { parentId: "pinned-folder", index: 0 });

    await syncPinnedFolder(api, state);

    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren.map((n) => n.title)).toEqual(["B", "A"]);
  });

  it("gracefully handles a deleted pinned folder by treating it as empty", async () => {
    const api = createFakeBrowserApi();
    const pinnedFolder = await api.createBookmark({ parentId: "root", title: "Pinned", type: "folder" });
    const a = await api.createBookmark({ parentId: pinnedFolder.id, title: "A", url: "https://a.test" });
    const dup = await api.createBookmark({ parentId: TOOLBAR_ID, title: "A", url: "https://a.test" });
    let state = createDefaultState({ pinnedFolderId: pinnedFolder.id, pinnedMap: { [a.id]: dup.id } });
    await api.removeBookmark(pinnedFolder.id);

    const next = await syncPinnedFolder(api, state);

    expect(next.pinnedMap).toEqual({});
    expect(next.pinnedFolderId).toBe(pinnedFolder.id);
    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren.map((n) => n.id)).not.toContain(dup.id);
  });
});