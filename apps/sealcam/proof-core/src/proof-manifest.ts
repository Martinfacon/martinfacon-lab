interface ProofManifestV1 {
  protocolVersion: "1.0.0"

  video: {
    fileName: string
    mimeType: string
    totalSize: number
    segmentSize: number
    segmentCount: number
    globalHash: string // hash de la concat des hashes segments
  }

  segments: Array<{
    index: number
    offset: number
    size: number
    hash: string
  }>

  timestamp: {
    createdAt: string // ISO 8601
    trustedTimestamp?: string // futur TSA
  }

  device: {
    keyId: string
    algorithm: "ECDSA_P256"
  }

  signature: {
    algorithm: "ECDSA_SHA256"
    value: string // base64
  }
}
