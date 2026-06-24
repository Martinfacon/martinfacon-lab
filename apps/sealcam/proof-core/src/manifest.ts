export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function stripSignature(manifest: any) {
  const copy = JSON.parse(JSON.stringify(manifest));

  if (copy.signature) {
    delete copy.signature.value;
  }

  return copy;
}

export function validateManifest(manifest: any): ValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== "object") {
    return { valid: false, errors: ["Manifest must be an object"] };
  }

  if (manifest.protocolVersion !== "1.0.0") {
    errors.push("protocolVersion must be '1.0.0'");
  }

  if (!manifest.video || typeof manifest.video !== "object") {
    errors.push("video is required");
  } else {
    if (typeof manifest.video.fileName !== "string" || manifest.video.fileName.trim() === "") {
      errors.push("video.fileName is required");
    }
    if (typeof manifest.video.mimeType !== "string" || manifest.video.mimeType.trim() === "") {
      errors.push("video.mimeType is required");
    }
    if (typeof manifest.video.totalSize !== "number" || manifest.video.totalSize < 0) {
      errors.push("video.totalSize must be a non-negative number");
    }
    if (typeof manifest.video.segmentSize !== "number" || manifest.video.segmentSize <= 0) {
      errors.push("video.segmentSize must be a positive number");
    }
    if (typeof manifest.video.segmentCount !== "number" || manifest.video.segmentCount < 0) {
      errors.push("video.segmentCount must be a non-negative number");
    }
    if (typeof manifest.video.globalHash !== "string" || manifest.video.globalHash.trim() === "") {
      errors.push("video.globalHash is required");
    }
  }

  if (!Array.isArray(manifest.segments)) {
    errors.push("segments must be an array");
  } else {
    manifest.segments.forEach((segment: any, index: number) => {
      if (!segment || typeof segment !== "object") {
        errors.push(`segments[${index}] must be an object`);
        return;
      }
      if (typeof segment.index !== "number" || segment.index < 0) {
        errors.push(`segments[${index}].index must be a non-negative number`);
      }
      if (typeof segment.offset !== "number" || segment.offset < 0) {
        errors.push(`segments[${index}].offset must be a non-negative number`);
      }
      if (typeof segment.size !== "number" || segment.size <= 0) {
        errors.push(`segments[${index}].size must be a positive number`);
      }
      if (typeof segment.hash !== "string" || segment.hash.trim() === "") {
        errors.push(`segments[${index}].hash is required`);
      }
    });
  }

  if (!manifest.timestamp || typeof manifest.timestamp !== "object") {
    errors.push("timestamp is required");
  } else if (typeof manifest.timestamp.createdAt !== "string" || manifest.timestamp.createdAt.trim() === "") {
    errors.push("timestamp.createdAt is required");
  }

  if (!manifest.device || typeof manifest.device !== "object") {
    errors.push("device is required");
  } else {
    if (typeof manifest.device.keyId !== "string" || manifest.device.keyId.trim() === "") {
      errors.push("device.keyId is required");
    }
    if (manifest.device.algorithm !== "ECDSA_P256") {
      errors.push("device.algorithm must be 'ECDSA_P256'");
    }
  }

  if (!manifest.signature || typeof manifest.signature !== "object") {
    errors.push("signature is required");
  } else {
    if (manifest.signature.algorithm !== "ECDSA_SHA256") {
      errors.push("signature.algorithm must be 'ECDSA_SHA256'");
    }
    if (typeof manifest.signature.value !== "string") {
      errors.push("signature.value must be a string");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}