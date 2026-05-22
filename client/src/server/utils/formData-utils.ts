export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value instanceof File) {
      // Handle file inputs
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      value.forEach((v, i) => {
        formData.append(`${key}[${i}]`, v);
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      // Handle primitive values
      formData.append(key, String(value));
    }
  });

  return formData;
}

export function formDataToJson(formData: FormData): Record<string, any> {
  const object: Record<string, any> = {};

  formData.forEach((value, key) => {
    // If key already exists (e.g. multiple fields with same name)
    if (object[key] !== undefined) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
      return;
    }

    // Try to parse JSON strings (optional)
    try {
      const parsed = JSON.parse(value as string);
      object[key] = parsed;
    } catch {
      object[key] = value;
    }
  });

  return object;
}
