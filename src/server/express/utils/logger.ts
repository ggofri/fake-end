import chalk from 'chalk';

export function logRequest(method: string, path: string, filePath: string): void {
  console.log(
    chalk.gray(`[${new Date().toISOString()}]`),
    getMethodColor(method)(method),
    chalk.blue(path),
    chalk.gray(`(${filePath})`),
  );
}

export function logResponse(status: number, duration: number): void {
  console.log(
    chalk.gray(`  → ${status}`),
    chalk.gray(`(${duration}ms)`),
  );
}

export function log404(path: string): void {
  console.log(
    chalk.gray(`[${new Date().toISOString()}]`),
    chalk.red("404"),
    chalk.blue(path),
    chalk.gray("(no mock found)"),
  );
}

function getMethodColor(method: string): (text: string) => string {
  switch (method) {
    case "GET": return chalk.blue;
    case "POST": return chalk.green;
    case "PUT": return chalk.yellow;
    case "DELETE": return chalk.red;
    case "PATCH": return chalk.magenta;
    default: return chalk.white;
  }
}
