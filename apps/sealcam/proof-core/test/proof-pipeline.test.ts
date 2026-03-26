import { describe, expect, test } from "vitest";
import { readFileSync } from "fs";
import { generateKeyPair } from "../src/sign";
import { createProof } from "../src/createProof";
import { verifyProof } from "../src/verifyProof";

describe("Proof Pipeline", () => {
  const videoOriginal = readFileSync("assets/sample.mp4");

  test("TEST 1 — Nominal (doit être valide)", async () => {
    const keys = await generateKeyPair();

    const manifest = await createProof(videoOriginal, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    const result = await verifyProof(
      videoOriginal,
      manifest,
      keys.publicKey
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("TEST 2 — Vidéo modifiée (doit échouer)", async () => {
    const keys = await generateKeyPair();

    const manifest = await createProof(videoOriginal, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    const corruptedVideo = Buffer.from(videoOriginal);
    corruptedVideo[0] = corruptedVideo[0] ^ 0xff;

    const result = await verifyProof(
      corruptedVideo,
      manifest,
      keys.publicKey
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Segment hash mismatch at index 0");
    expect(result.errors).toContain("Global hash mismatch");
  });

  test("TEST 3 — Manifest modifié (doit échouer signature)", async () => {
    const keys = await generateKeyPair();

    const manifest = await createProof(videoOriginal, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    // Modifier le manifest
    const modifiedManifest = {
      ...manifest,
      video: {
        ...manifest.video,
        totalSize: 999999
      }
    };

    const result = await verifyProof(
      videoOriginal,
      modifiedManifest,
      keys.publicKey
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid signature");
  });

  test("TEST 4 — Signature modifiée (doit échouer)", async () => {
    const keys = await generateKeyPair();

    const manifest = await createProof(videoOriginal, {
      fileName: "sample.mp4",
      mimeType: "video/mp4",
      segmentSize: 1024,
      privateKeyPem: keys.privateKey
    });

    // Modifier la signature
    const modifiedManifest = {
      ...manifest,
      signature: {
        ...manifest.signature,
        value: "fake-signature"
      }
    };

    const result = await verifyProof(
      videoOriginal,
      modifiedManifest,
      keys.publicKey
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid signature");
  });
});