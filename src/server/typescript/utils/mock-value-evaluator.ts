export function evaluateArrowFunction(expression: string): unknown {
  try {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return eval(expression)();
  } catch {
    return null;
  }
}

export function tryParseJson(value: string): { success: boolean; data?: unknown } {
  try {
    return { success: true, data: JSON.parse(value) };
  } catch {
    return { success: false };
  }
}

export function isArrowFunction(value: string): boolean {
  return value.startsWith('() =>');
}
