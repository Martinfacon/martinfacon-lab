export function stripSignature(manifest: any) {
  const copy = JSON.parse(JSON.stringify(manifest));

  if (copy.signature) {
    delete copy.signature.value;
  }

  return copy;
}