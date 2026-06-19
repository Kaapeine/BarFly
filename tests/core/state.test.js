import { describe, it, expect } from "vitest";
import { createDefaultState } from "../../src/core/state.js";

describe("createDefaultState", () => {
  it("returns the expected shape with no folder/separator configured yet", () => {
    expect(createDefaultState()).toEqual({
      pinnedFolderId: null,
      separatorId: null,
      capacity: 10,
      dynamicMap: {},
      pinnedMap: {},
    });
  });

  it("allows overriding capacity", () => {
    expect(createDefaultState({ capacity: 50 }).capacity).toBe(50);
  });
});
