# 📦 proof-core

Core cryptographic engine for Sealcam.

`proof-core` is responsible for generating, signing, and verifying tamper-evident video proofs.

It does **not** handle:
- video capture
- UI
- storage
- backend
- networking

It strictly implements the cryptographic proof protocol.

---

# Objective

Provide a deterministic, independently verifiable proof that:

- A video file has not been modified
- The proof was signed by a specific cryptographic key
- The file content matches exactly what was signed

The module is designed to produce a self-contained proof manifest that can be verified offline by a third party.

---

# Architecture Overview

video file
↓
segmentation
↓
hash each segment (SHA-256)
↓
compute global hash
↓
generate ProofManifestV1
↓
canonicalize manifest
↓
sign manifest (ECDSA P-256)
↓
produce proof package


---

# Proof Manifest (ProofManifestV1)

The manifest is the formal representation of the proof.

It contains:

- Protocol version
- Video metadata
- Segment hashes
- Global hash
- Timestamp
- Device cryptographic identity
- Signature

The signature covers the entire manifest (excluding the signature field itself).

The manifest is the central cryptographic contract between:

- the file
- the hash structure
- the signing key

---

# Cryptographic Model

## Hashing

- Algorithm: SHA-256
- Each segment is hashed independently
- A global hash is computed from the concatenation of segment hashes

This provides:
- Full file integrity
- Detection of localized tampering
- Deterministic reproducibility

---

## Signature

- Algorithm: ECDSA P-256
- Hash: SHA-256
- Key format: PKCS8 (private), SPKI (public)

The manifest is serialized deterministically and signed.

The signature proves:
- Authenticity (signed by holder of private key)
- Integrity (data unchanged since signature)

---

# Verification Model

A verifier must:

1. Recompute segment hashes from the video file
2. Recompute the global hash
3. Rebuild the manifest (without signature)
4. Canonicalize it
5. Verify the signature using the public key

If any byte of the video changes:
→ verification fails.

---

# Proof Package Concept

A complete proof package contains:

- video file
- proof-manifest.json
- signature
- public key (or certificate)

This package can be transmitted to:
- an insurer
- a lawyer
- a court expert
- an independent verifier

No backend dependency is required.

---

# What This Proves

- The video file has not been altered since signing
- The proof is cryptographically authentic
- The proof can be verified independently

---

# What This Does NOT Prove

- The real-world event is authentic
- The timestamp is legally trusted (unless backed by TSA)
- The signer’s legal identity (unless tied to certified key)
- That the file was not manipulated before signing

This module guarantees integrity, not factual truth.

---

# Module Structure

src/
hash.ts → segment hashing logic
manifest.ts → ProofManifestV1 model
sign.ts → key generation & signing
verify.ts → verification engine
index.ts → test entrypoint


---

# Current Status (V1)

✔ SHA-256 segment hashing  
✔ Global hash computation  
✔ ECDSA P-256 signing  
✔ Signature verification  
✔ Structured manifest  

Not yet implemented:

- Deterministic canonical JSON serializer
- Trusted timestamp (TSA)
- Public key certificate chain
- Secure key storage integration
- Streaming hash for large files

---

# Design Principles

- Deterministic
- Offline verifiable
- Minimal dependencies
- Cryptographically standard
- Evolvable via protocolVersion

---

# Future Evolution

Possible extensions:

- Trusted timestamp authority (RFC 3161)
- Merkle tree instead of linear hash concatenation
- Hardware-backed keys (Secure Enclave / Android Keystore)
- Evidence export format standardization
- CLI verifier tool

---

# Role Within Sealcam

`proof-core` is the cryptographic backbone.

The mobile app will:
- capture video
- call proof-core
- store the proof package

The CLI/verifier tool will:
- load proof package
- verify integrity
- output verification report

---

# Summary

`proof-core` transforms a raw video file into a cryptographically sealed, independently verifiable digital proof.

It does not claim legal authority.  
It provides cryptographic integrity.

Everything else (identity, timestamp trust, admissibility) builds on top of this layer.