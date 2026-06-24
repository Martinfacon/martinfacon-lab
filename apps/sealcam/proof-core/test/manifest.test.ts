import { describe, expect, test } from "vitest";
import { validateManifest } from "../src/manifest";

describe("validateManifest", () => {
  test("should accept a structurally valid manifest", () => {
    const manifest = {
      protocolVersion: "1.0.0",
      video: {
        fileName: "sample.mp4",
        mimeType: "video/mp4",
        totalSize: 100,
        segmentSize: 10,
        segmentCount: 10,
        globalHash: "abc123"
      },
      segments: [
        { index: 0, offset: 0, size: 10, hash: "hash-0" }
      ],
      timestamp: {
        createdAt: "2026-06-24T00:00:00.000Z"
      },
      device: {
        keyId: "device-1",
        algorithm: "ECDSA_P256"
      },
      signature: {
        algorithm: "ECDSA_SHA256",
        value: "signature"
      }
    };

    const result = validateManifest(manifest);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("should reject a manifest with missing required fields", () => {
    const manifest = {
      protocolVersion: "1.0.0",
      video: {
        fileName: "sample.mp4",
        mimeType: "video/mp4",
        totalSize: 100,
        segmentSize: 10,
        segmentCount: 10,
        globalHash: "abc123"
      },
      segments: [],
      timestamp: {},
      device: {
        keyId: "device-1",
        algorithm: "ECDSA_P256"
      }
    };

    const result = validateManifest(manifest);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("timestamp.createdAt")]))
  });

  test("should reject an unsupported protocol version", () => {
    const manifest = {
      protocolVersion: "2.0.0",
      video: {
        fileName: "sample.mp4",
        mimeType: "video/mp4",
        totalSize: 100,
        segmentSize: 10,
        segmentCount: 10,
        globalHash: "abc123"
      },
      segments: [],
      timestamp: {
        createdAt: "2026-06-24T00:00:00.000Z"
      },
      device: {
        keyId: "device-1",
        algorithm: "ECDSA_P256"
      },
      signature: {
        algorithm: "ECDSA_SHA256",
        value: "signature"
      }
    };

    const result = validateManifest(manifest);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("protocolVersion")]))
  });
});
