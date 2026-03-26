// src/createProof.ts

import { hashBufferInSegments } from "./hash";
import { signManifest } from "./sign";
import type { ProofManifestV1 } from "./proof-manifest";

export async function createProof(
  video: Buffer,
  options: {
    fileName: string;
    mimeType: string;
    segmentSize: number;
    privateKeyPem: string;
  }
): Promise<ProofManifestV1> {
  const { fileName, mimeType, segmentSize, privateKeyPem } = options;

  // Hash vidéo
  const { segments, globalHash } = hashBufferInSegments(
    video,
    segmentSize
  );

  // Construire manifest
  const manifest: ProofManifestV1 = {
    protocolVersion: "1.0.0",

    video: {
      fileName,
      mimeType,
      totalSize: video.length,
      segmentSize,
      segmentCount: segments.length,
      globalHash
    },

    segments,

    timestamp: {
      createdAt: new Date().toISOString()
    },

    device: {
      keyId: "local-dev-key",
      algorithm: "ECDSA_P256"
    },

    signature: {
      algorithm: "ECDSA_SHA256",
      value: ""
    }
  };

  // 3️⃣ Signature (utilise ton sign.ts actuel)
  const signature = await signManifest(manifest, privateKeyPem);

  // 4️⃣ Injection signature
  manifest.signature.value = signature;

  return manifest;
}