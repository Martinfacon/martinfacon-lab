import { describe, expect, test } from "vitest";
import { canonicalize } from "../src/canonicalize";
import { stripSignature } from "../src/manifest";
import { generateKeyPair, signManifest } from "../src/sign";
import { verifyManifest } from "../src/verify";

describe("canonicalize", () => {
  test("should produce same output regardless of key order", () => {
    const a = { b: 1, a: 2 };
    const b = { a: 2, b: 1 };

    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  test("should canonicalize nested objects deterministically", () => {
    const a = { z: { b: 2, a: 1 } };
    const b = { z: { a: 1, b: 2 } };

    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  test("should preserve array order", () => {
    const a = { arr: [1, 2, 3] };
    const b = { arr: [3, 2, 1] };

    expect(canonicalize(a)).not.toBe(canonicalize(b));
  });

  test("should be stable across multiple calls", () => {
    const obj = { b: 1, a: 2 };

    const first = canonicalize(obj);
    const second = canonicalize(obj);

    expect(first).toBe(second);
  });

  test("should correctly encode strings", () => {
    const obj = { text: "hello world" };
    expect(canonicalize(obj)).toBe('{"text":"hello world"}');
  });

  test("should normalize numbers", () => {
    const obj = { num: 1.0 };
    expect(canonicalize(obj)).toBe('{"num":1}');
  });

  test("should handle null and boolean", () => {
    const obj = { a: null, b: true, c: false };
    expect(canonicalize(obj)).toBe('{"a":null,"b":true,"c":false}');
  });
});

describe("stripSignature", () => {
  test("should remove signature value", () => {
    const manifest = {
      data: "test",
      signature: {
        value: "abc123",
      },
    };

    const stripped = stripSignature(manifest);

    expect(stripped.signature.value).toBeUndefined();
  });

  test("should not mutate original manifest", () => {
    const manifest = {
      signature: { value: "abc" },
    };

    const copy = stripSignature(manifest);

    expect(manifest.signature.value).toBe("abc");
    expect(copy.signature.value).toBeUndefined();
  });
});

describe("end-to-end sign + verify", () => {
  test("should verify a signed manifest", async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const manifest = {
      protocolVersion: "1.0.0",
      video: {
        fileName: "test.mp4",
        mimeType: "video/mp4",
        totalSize: 123,
        segmentSize: 64,
        segmentCount: 1,
        globalHash: "abc",
      },
      segments: [{ index: 0, offset: 0, size: 123, hash: "def" }],
      timestamp: { createdAt: new Date().toISOString() },
      device: { keyId: "device-1", algorithm: "ECDSA_P256" },
      signature: { algorithm: "ECDSA_SHA256", value: "" },
    };

    const signature = await signManifest(manifest, privateKey);
    const verified = await verifyManifest(manifest, signature, publicKey);

    expect(verified).toBe(true);
  });
});
