import { readFileSync } from "fs";
import { describe, expect, test } from "vitest";
import { createProof } from "../src/createProof";
import { generateKeyPair } from "../src/sign";
import { verifyProof } from "../src/verifyProof";

describe("verifyProof", () => {
  test("should validate an unchanged proof", async () => {
    const video = readFileSync("assets/sample.mp4");
    const keys = await generateKeyPair();

    const manifest = await createProof(video, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    const result = await verifyProof(video, manifest, keys.publicKey);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("should reject a tampered video", async () => {
    const video = readFileSync("assets/sample.mp4");
    const keys = await generateKeyPair();

    const manifest = await createProof(video, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    const tamperedVideo = Buffer.from(video);
    tamperedVideo[0] = tamperedVideo[0] ^ 0xff;

    const result = await verifyProof(tamperedVideo, manifest, keys.publicKey);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining("hash")]))
  });
});
