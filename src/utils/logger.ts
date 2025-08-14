let isVerbose = false;

export function setVerbose(verbose: boolean): void {
  isVerbose = verbose;
}

export function verboseLog(...args: unknown[]): void {
  if (isVerbose) {
    console.log(...args);
  }
}

export function verboseError(...args: unknown[]): void {
  if (isVerbose) {
    console.error(...args);
  }
}

export function verboseWarn(...args: unknown[]): void {
  if (isVerbose) {
    console.warn(...args);
  }
}
