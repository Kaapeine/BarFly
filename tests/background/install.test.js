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
});