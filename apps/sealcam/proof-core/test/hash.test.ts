import { createHash } from "crypto";
import { describe, expect, test } from "vitest";
import { hashBufferInSegments } from "../src/hash";

describe("hashBufferInSegments", () => {
  test("should split a buffer into expected segments and compute a global hash", () => {
    const buffer = Buffer.from("hello-world");
    const result = hashBufferInSegments(buffer, 5);

    expect(result.segments).toHaveLength(3);
    expect(result.segments[0]).toMatchObject({
      index: 0,
      offset: 0,
      size: 5
    });
    expect(result.segments[1]).toMatchObject({
      index: 1,
      offset: 5,
      size: 5
    });
    expect(result.segments[2]).toMatchObject({
      index: 2,
      offset: 10,
      size: 1
    });

    const expectedJoined = result.segments.map((segment) => segment.hash).join("");
    const expectedGlobalHash = createHash("sha256").update(expectedJoined).digest("hex");

    expect(result.globalHash).toBe(expectedGlobalHash);
  });

  test("should handle an empty buffer", () => {
    const result = hashBufferInSegments(Buffer.alloc(0), 4);

    expect(result.segments).toHaveLength(0);
    expect(result.globalHash).toBe(createHash("sha256").update("").digest("hex"));
  });
});
