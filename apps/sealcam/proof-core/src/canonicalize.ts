export function canonicalize(value: any): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Invalid number in JSON");
    }
    return Number(value).toString();
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map(item => canonicalize(item));
    return `[${items.join(",")}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value).sort();

    const entries = keys.map(key => {
      const k = JSON.stringify(key);
      const v = canonicalize(value[key]);
      return `${k}:${v}`;
    });

    return `{${entries.join(",")}}`;
  }

  throw new Error(`Unsupported type: ${typeof value}`);
}