import { describe, it, expect } from "vitest";
import { createFakeBrowserApi } from "../platform/fake-browser-api.js";
import { TOOLBAR_ID } from "../../src/platform/browser-api.js";
import { runInstall } from "../../src/background/install.js";

describe("runInstall", () => {
  it("creates a separator with the given capacity and empty entries", async () => {
    const api = createFakeBrowserApi();

    const state = await runInstall(api, 5);

    expect(state.separatorId).toBeDefined();
    expect(state.capacity).toBe(5);
    expect(state.entries).toEqual([]);

    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    expect(toolbarChildren).toEqual([
      expect.objectContaining({ id: state.separatorId, type: "separator" }),
    ]);
  });

  it("defaults capacity to 10", async () => {
    const api = createFakeBrowserApi();

    const state = await runInstall(api);

    expect(state.capacity).toBe(10);
  });

  it("persists state to storage", async () => {
    const api = createFakeBrowserApi();

    const state = await runInstall(api, 7);
    const persisted = await api.getState();

    expect(persisted).toEqual(state);
  });

  it("reuses an existing separator instead of creating a second one", async () => {
    const api = createFakeBrowserApi();
    const existing = await api.createBookmark({
      parentId: TOOLBAR_ID,
      index: 0,
      type: "separator",
    });

    const state = await runInstall(api, 5);

    expect(state.separatorId).toBe(existing.id);

    const toolbarChildren = await api.getChildren(TOOLBAR_ID);
    const separators = toolbarChildren.filter((c) => c.type === "separator");
    expect(separators).toHaveLength(1);
  });
});