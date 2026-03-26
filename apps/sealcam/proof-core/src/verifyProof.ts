import { hashBufferInSegments } from "./hash";
import { verifyManifest } from "./verify";
import type { ProofManifestV1 } from "./proof-manifest";

export async function verifyProof(
  video: Buffer,
  manifest: ProofManifestV1,
  publicKeyPem: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Recalcul des hashes
  const { segments, globalHash } = hashBufferInSegments(
    video,
    manifest.video.segmentSize
  );

  // Vérification nombre de segments
  if (segments.length !== manifest.segments.length) {
    errors.push("Segment count mismatch");
  }

  // Vérification hash des segments
  for (let i = 0; i < segments.length; i++) {
    const expected = manifest.segments[i];
    const actual = segments[i];

    if (!expected || expected.hash !== actual.hash) {
      errors.push(`Segment hash mismatch at index ${i}`);
      break; // inutile de continuer
    }
  }

  // Vérification global hash
  if (globalHash !== manifest.video.globalHash) {
    errors.push("Global hash mismatch");
  }

  // Vérification signature
  const signatureValid = await verifyManifest(
    manifest,
    manifest.signature.value,
    publicKeyPem
  );

  if (!signatureValid) {
    errors.push("Invalid signature");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}