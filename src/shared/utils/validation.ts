export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export function hasRequiredProperties(obj: Record<string, unknown>, properties: string[]): boolean {
  return properties.every(prop => prop in obj);
}

export function hasValidPropertyTypes(
  obj: Record<string, unknown>, 
  typeValidations: Record<string, (value: unknown) => boolean>
): boolean {
  return Object.entries(typeValidations).every(([prop, validator]) => validator(obj[prop]));
}

export function isValidHttpMethod(method: unknown): method is string {
  return typeof method === 'string' &&
         ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}
