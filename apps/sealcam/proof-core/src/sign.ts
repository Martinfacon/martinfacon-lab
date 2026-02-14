// src/sign.ts
import { webcrypto } from "crypto";

const { subtle } = webcrypto;

export interface KeyPairPEM {
  publicKey: string;
  privateKey: string;
}

function toPEM(buffer: ArrayBuffer, label: string): string {
  const base64 = Buffer.from(buffer).toString("base64");
  const formatted = base64.match(/.{1,64}/g)?.join("\n");
  return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}

export async function generateKeyPair(): Promise<KeyPairPEM> {
  const keyPair = await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: toPEM(publicKey, "PUBLIC KEY"),
    privateKey: toPEM(privateKey, "PRIVATE KEY"),
  };
}

export async function signManifest(
  manifest: object,
  privateKeyPem: string
): Promise<string> {
  const keyData = Buffer.from(
    privateKeyPem
      .replace(/-----.*?-----/g, "")
      .replace(/\s+/g, ""),
    "base64"
  );

  const privateKey = await subtle.importKey(
    "pkcs8",
    keyData,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign"]
  );

  const canonical = JSON.stringify(manifest);
  const data = new TextEncoder().encode(canonical);

  const signature = await subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    privateKey,
    data
  );

  return Buffer.from(signature).toString("base64");
}