// src/verify.ts
import { webcrypto } from "crypto";

const { subtle } = webcrypto;

export async function verifyManifest(
  manifest: object,
  signatureBase64: string,
  publicKeyPem: string
): Promise<boolean> {
  const keyData = Buffer.from(
    publicKeyPem
      .replace(/-----.*?-----/g, "")
      .replace(/\s+/g, ""),
    "base64"
  );

  const publicKey = await subtle.importKey(
    "spki",
    keyData,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["verify"]
  );

  const canonical = JSON.stringify(manifest);
  const data = new TextEncoder().encode(canonical);

  const signature = Buffer.from(signatureBase64, "base64");

  return subtle.verify(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    publicKey,
    signature,
    data
  );
}