import { describe, it, expect } from "vitest";
import { createFakeBrowserApi } from "../platform/fake-browser-api.js";
import { TOOLBAR_ID } from "../../src/platform/browser-api.js";
import { resolveInitState } from "../../src/core/init.js";

describe("resolveInitState", () => {
  // -----------------------------------------------------------------------
  // Case 1: State + separator both exist → normal restart
  // -----------------------------------------------------------------------
  it("Case 1: returns saved state when both state and separator exist", async () => {
    const api = createFakeBrowserApi();
    const separator = await api.createBookmark({
      parentId: TOOLBAR_ID,
      index: 0,
      type: "separator",
    });
    const savedState = {
      separatorId: separator.id,
      capacity: 5,
      entries: [{ originalId: "1", duplicateId: "2" }],
    };
    await api.setState(savedState);

    const { state } = await resolveInitState(api);

    expect(state).toEqual(savedState);
    expect(api.getState()).resolves.toEqual(savedState);
  });

  // -----------------------------------------------------------------------
  // Case 2: State exists, separator missing → recreate + notify
  // -----------------------------------------------------------------------
  it("Case 2: recreates separator and returns notification when separator is missing", async () => {
    const api = createFakeBrowserApi();
    const savedState = {
      separatorId: "old-sep",
      capacity: 5,
      entries: [{ originalId: "1", duplicateId: "2" }],
    };
    await api.setState(savedState);

    const { state } = await resolveInitState(api);

    expect(state.separatorId).not.toBe("old-sep");
    expect(state.capacity).toBe(5);
    expect(state.entries).toEqual([{ originalId: "1", duplicateId: "2" }]);

    const toolbar = await api.getChildren(TOOLBAR_ID);
    expect(toolbar[0].type).toBe("separator");
    expect(toolbar[0].id).toBe(state.separatorId);
  });

  // -----------------------------------------------------------------------
  // Case 3: No state, separator exists → reconstruct from toolbar
  // -----------------------------------------------------------------------
  it("Case 3: reconstructs state from existing separator when storage is empty", async () => {
    const api = createFakeBrowserApi();
    const separator = await api.createBookmark({
      parentId: TOOLBAR_ID,
      index: 0,
      type: "separator",
    });

    const { state } = await resolveInitState(api);

    expect(state.separatorId).toBe(separator.id);
    expect(state.capacity).toBe(10);
    expect(state.entries).toEqual([]);

    const persisted = await api.getState();
    expect(persisted).toEqual(state);
  });

  // -----------------------------------------------------------------------
  // Case 4: No state, no separator → setup mode
  // -----------------------------------------------------------------------
  it("Case 4: returns null state when neither state nor separator exist", async () => {
    const api = createFakeBrowserApi();

    const { state } = await resolveInitState(api);

    expect(state).toBeNull();
  });
});