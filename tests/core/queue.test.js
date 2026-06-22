import { describe, it, expect } from "vitest";
import { createSerialQueue } from "../../src/core/queue.js";

describe("createSerialQueue", () => {
  it("runs tasks one at a time in FIFO order, never interleaving", async () => {
    const queue = createSerialQueue();
    const log = [];
    const task = (label) => async () => {
      log.push(`${label}:start`);
      await Promise.resolve();
      await Promise.resolve();
      log.push(`${label}:end`);
    };
    const a = queue.enqueue(task("a"));
    const b = queue.enqueue(task("b"));
    await Promise.all([a, b]);
    expect(log).toEqual(["a:start", "a:end", "b:start", "b:end"]);
  });

  it("returns the task's resolved value to the caller", async () => {
    const queue = createSerialQueue();
    await expect(queue.enqueue(async () => 42)).resolves.toBe(42);
  });

  it("a rejected task does not poison later tasks", async () => {
    const queue = createSerialQueue();
    const failed = queue.enqueue(async () => {
      throw new Error("boom");
    });
    const after = queue.enqueue(async () => "ok");
    await expect(failed).rejects.toThrow("boom");
    await expect(after).resolves.toBe("ok");
  });
});
