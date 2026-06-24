import { readFileSync } from "fs";
import { describe, expect, test } from "vitest";
import { createProof } from "../src/createProof";
import { generateKeyPair } from "../src/sign";
import { hashBufferInSegments } from "../src/hash";

describe("createProof", () => {
  test("should create a signed manifest with expected metadata", async () => {
    const video = readFileSync("assets/sample.mp4");
    const keys = await generateKeyPair();

    const manifest = await createProof(video, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    const expectedHash = hashBufferInSegments(video, 1024);

    expect(manifest.protocolVersion).toBe("1.0.0");
    expect(manifest.video.totalSize).toBe(video.length);
    expect(manifest.video.segmentCount).toBe(expectedHash.segments.length);
    expect(manifest.video.globalHash).toBe(expectedHash.globalHash);
    expect(manifest.signature.value).not.toBe("");
    expect(manifest.signature.algorithm).toBe("ECDSA_SHA256");
  });
});
