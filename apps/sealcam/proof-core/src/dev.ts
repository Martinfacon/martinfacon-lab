import { readFileSync } from "fs";
import { generateKeyPair } from "./sign";
import { createProof } from "./createProof";
import { verifyProof } from "./verifyProof";

async function main() {
  console.log("Mode développement - Proof Core");
  console.log("Utilisez 'npm run test' pour lancer les tests automatisés");
  console.log("");

  // Exemple d'utilisation
  const video = readFileSync("assets/sample.mp4");
  const keys = await generateKeyPair();

  console.log("Taille vidéo:", video.length, "bytes");
  console.log("Clés générées");

  const manifest = await createProof(video, {
    fileName: "sample.mp4",
    mimeType: "video/mp4",
    segmentSize: 1024 * 1024, // 1MB segments
    privateKeyPem: keys.privateKey
  });

  console.log("Proof créé");
  console.log("Segments:", manifest.segments.length);
  console.log("Signature:", manifest.signature.value.substring(0, 20) + "...");

  const result = await verifyProof(video, manifest, keys.publicKey);
  console.log("Vérification:", result.valid ? "✅ VALIDE" : "❌ INVALIDE");

  if (!result.valid) {
    console.log("Erreurs:", result.errors);
  }
}

main().catch(console.error);