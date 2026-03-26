# SealCam Proof Format Specification
## Version 1.0.0

---

# 1. Introduction

This document defines the **SealCam Proof Format v1.0.0**.

It specifies how a video file is transformed into a **cryptographically verifiable proof**, including:

- segmentation
- hashing
- manifest structure
- canonicalization
- signature
- verification process

This specification is **implementation-independent**.

Any implementation conforming to this document MUST produce identical results for identical inputs.

---

# 2. Terminology

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are to be interpreted as described in RFC 2119.

---

# 3. Overview

A proof is generated as follows:

video → segmentation → segment hashes → global hash → manifest → canonicalization → signature


The result is a **Proof Package** containing:

- the video file
- the proof manifest
- the signature
- the public key (or reference)

---

# 4. Data Model

## 4.1 Proof Manifest

The proof manifest MUST conform to the following structure:

```json
{
  "protocolVersion": "1.0.0",
  "video": {
    "fileName": "string",
    "mimeType": "string",
    "totalSize": number,
    "segmentSize": number,
    "segmentCount": number,
    "globalHash": "hex-string"
  },
  "segments": [
    {
      "index": number,
      "offset": number,
      "size": number,
      "hash": "hex-string"
    }
  ],
  "timestamp": {
    "createdAt": "ISO-8601 string",
    "trustedTimestamp": "string (optional)"
  },
  "device": {
    "keyId": "string",
    "algorithm": "ECDSA_P256"
  },
  "signature": {
    "algorithm": "ECDSA_SHA256",
    "value": "base64-string"
  }
}
```

---

# 5. Segmentation

## 5.1 Rules

- The video MUST be treated as a raw byte sequence
- The file MUST be split into contiguous segments of size **segmentSize**
- The last segment MAY be smaller

## 5.2 Constraints

- Segments MUST be processed in ascending order
- No bytes MUST be skipped or duplicated

---

# 6. Segment Hashing

For each segment:

```typescript
segment_hash_i = SHA-256(segment_bytes_i)
```

- Output MUST be encoded as lowercase haxadecimal string
- Each segment hash MUST be independant

---

# 7. Global Hash

The global hash MUST be computed as follows:

```typescript
concatenated = segment_hash_0 || segment_hash_1 || ... || segment_hash_n
global_hash = SHA-256(concatenated)
```

Where:
- **||** denotes string concatenation of hex strings
- The order MUST follow segment index

---

# 8. Manifest Construction

The manifest MUST include:

- all segment hashes
- global hash
- metadata
- timestamp
- device information

The **signature.value** field MUST be empty or omitted before signing.

---

# 9. Canonicalization

## 9.1 Requirement

The manifest MUST be serialized deterministically before signing.

## 9.2 Rules

- UTF-8 encoding MUST be used
- Object keys MUST be sorted lexicographically
- No extra whitespace is allowed
- Numbers MUST be represented without trailing zeros
- Arrays MUST preserve order

## 9.3 Signature Input

```typescript
signature_input = canonicalize(manifest_without_signature)
```

---

# 10. Signature

## 10.1 Algorithm

- Algorithm: ECDSA
- Curve: P-256
- Hash: SHA-256

## 10.2 Process

```typescript
signature = ECDSA_SIGN(private_key, signature_input)
```

## 10.3 Encoding

- Signature MUST be encoded in base64
- Signature format MUST be DER-encoded

---

# 11. Verification

A proof is valid if and only if all the following checks pass:

## 11.1 Segment Integrity

- Recompute all segment hashes
- Compare with manifest

## 11.2 Global Hash

- Recompute global hash
- Compare with manifest

## 11.3 Manifest Reconstruction

- Remove signature.value
- Canonicalize manifest

## 11.4 Signature Verification

```typescript
valid = ECDSA_VERIFY(public_key, signature_input, signature)
```

---

# 12. Failure Conditions

A proof MUST be considered invalid if:

- Any segment hash differs
- Segment count is inconsistent
- Global hash mismatch
- Signature verification fails
- Manifest structure is invalid

---

# 13. Security Considerations

This protocol guarantees:

- data integrity
- cryptographic authenticity

This protocol does NOT grarantee:

- real-world truth of the recorded event
- trusted timestamp (unless external authority is used)
- identity of the signer

---

# 14. Future Extensions

Future version MAY include:

- trusted timestamp authority (RFC 3161)
- Merkle tree structure
- hardware-backed keys
- certificate chain validation

---

# 15. Conformance

1n implementation is compliant if:

- it produces identical hashes for identical inputs
- if follows canonicalization rules
- it verifies proofs according to section 11