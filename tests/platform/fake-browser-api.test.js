import { describe, it, expect, vi } from "vitest";
import { createFakeBrowserApi } from "./fake-browser-api.js";

describe("createFakeBrowserApi", () => {
  it("creates a bookmark, assigns an id, and fires onBookmarkCreated", async () => {
    const api = createFakeBrowserApi();
    const cb = vi.fn();
    api.onBookmarkCreated(cb);

    const node = await api.createBookmark({ parentId: "toolbar", title: "A", url: "https://a.test" });

    expect(node.id).toBeDefined();
    expect(cb).toHaveBeenCalledWith(node.id, expect.objectContaining({ title: "A", url: "https://a.test" }));
  });

  it("returns children sorted by index", async () => {
    const api = createFakeBrowserApi();
    const a = await api.createBookmark({ parentId: "toolbar", title: "A", url: "https://a.test" });
    const b = await api.createBookmark({ parentId: "toolbar", title: "B", url: "https://b.test", index: 0 });

    const children = await api.getChildren("toolbar");
    expect(children.map((n) => n.id)).toEqual([b.id, a.id]);
  });

  it("removes a bookmark and fires onBookmarkRemoved", async () => {
    const api = createFakeBrowserApi();
    const cb = vi.fn();
    api.onBookmarkRemoved(cb);
    const node = await api.createBookmark({ parentId: "toolbar", title: "A", url: "https://a.test" });

    await api.removeBookmark(node.id);

    expect(cb).toHaveBeenCalledWith(node.id, expect.objectContaining({ parentId: "toolbar" }));
    expect(await api.getChildren("toolbar")).toEqual([]);
  });

  it("moves a bookmark and fires onBookmarkMoved with old and new position", async () => {
    const api = createFakeBrowserApi();
    const cb = vi.fn();
    const node = await api.createBookmark({ parentId: "folder-1", title: "A", url: "https://a.test" });
    api.onBookmarkMoved(cb);

    await api.moveBookmark(node.id, { parentId: "toolbar", index: 0 });

    expect(cb).toHaveBeenCalledWith(
      node.id,
      expect.objectContaining({ parentId: "toolbar", index: 0, oldParentId: "folder-1", oldIndex: 0 })
    );
  });

  it("stores and retrieves state", async () => {
    const api = createFakeBrowserApi();
    expect(await api.getState()).toBeNull();
    await api.setState({ capacity: 10 });
    expect(await api.getState()).toEqual({ capacity: 10 });
  });
});