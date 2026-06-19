import { describe, it, expect } from "vitest";
import { diffPinnedFolder } from "../../src/core/pinned.js";

describe("diffPinnedFolder", () => {
  it("creates duplicates for originals with none yet", () => {
    const result = diffPinnedFolder(["a", "b"], {});
    expect(result).toEqual({ toCreate: ["a", "b"], toRemove: [], order: ["a", "b"] });
  });

  it("removes duplicates for originals no longer in the folder", () => {
    const result = diffPinnedFolder(["a"], { a: "dup-a", b: "dup-b" });
    expect(result).toEqual({ toCreate: [], toRemove: ["b"], order: ["a"] });
  });

  it("creates nothing and removes nothing when already in sync", () => {
    const result = diffPinnedFolder(["a", "b"], { a: "dup-a", b: "dup-b" });
    expect(result).toEqual({ toCreate: [], toRemove: [], order: ["a", "b"] });
  });

  it("preserves the folder's order even when mixed with creates/removes", () => {
    const result = diffPinnedFolder(["b", "c"], { a: "dup-a", b: "dup-b" });
    expect(result).toEqual({ toCreate: ["c"], toRemove: ["a"], order: ["b", "c"] });
  });
});