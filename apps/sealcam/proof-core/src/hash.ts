import { createHash } from "crypto"
import { readFileSync } from "fs"

export interface SegmentHash {
  index: number
  offset: number
  size: number
  hash: string
}

export interface HashResult {
  segments: SegmentHash[]
  globalHash: string
}

export function hashBufferInSegments(
  buffer: Buffer,
  segmentSize: number
): HashResult {
  const segments: SegmentHash[] = []

  let offset = 0
  let index = 0

  while (offset < buffer.length) {
    const end = Math.min(offset + segmentSize, buffer.length)
    const slice = buffer.subarray(offset, end)

    const hash = createHash("sha256")
      .update(slice)
      .digest("hex")

    segments.push({
      index,
      offset,
      size: slice.length,
      hash
    })

    offset = end
    index++
  }

  // Global hash = hash(concat(segment_hashes))
  const concatenatedHashes = segments.map(s => s.hash).join("")

  const globalHash = createHash("sha256")
    .update(concatenatedHashes)
    .digest("hex")

  return { segments, globalHash }
}
