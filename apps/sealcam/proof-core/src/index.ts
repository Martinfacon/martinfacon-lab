import { readFileSync } from "fs"
import { hashBufferInSegments } from "./hash"

const file = readFileSync("sample.mp4")

const result = hashBufferInSegments(file, 1024 * 1024) // 1MB segments

console.log(result.globalHash)
