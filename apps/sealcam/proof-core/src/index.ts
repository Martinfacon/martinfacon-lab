import { generateKeyPair, signManifest } from "./sign";
import { verifyManifest } from "./verify";

async function main() {
  const manifest = {
    videoId: "test",
    segments: [],
    globalHash: "abc123"
  };

  const keys = await generateKeyPair();

  const signature = await signManifest(manifest, keys.privateKey);

  const isValid = await verifyManifest(
    manifest,
    signature,
    keys.publicKey
  );

  console.log("Signature valide :", isValid);
}

main();