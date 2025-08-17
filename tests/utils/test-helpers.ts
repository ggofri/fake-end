import { serverManager, ServerInstance } from './server-utils';
import { createHttpClient, HttpClient } from './http-client';

export interface TestContext {
  server: ServerInstance;
  client: HttpClient;
  mockDir: string;
}

export async function createTestContext(options: {
  port?: number;
  mockDir?: string;
  timeout?: number;
} = {}): Promise<TestContext> {
  const server = await serverManager.startServer(options);
  const client = createHttpClient(`http://localhost:${server.port}`);
  
  return {
    server,
    client,
    mockDir: server.mockDir
  };
}

export async function cleanupTestContext(context: TestContext): Promise<void> {
  await context.server.cleanup();
}

export function createYamlMockFile(endpoints: Array<{
  method: string;
  path: string;
  status: number;
  body?: any;
  delayMs?: number;
  headers?: Record<string, string>;
  guard?: {
    condition: {
      field: string;
      operator: string;
      value?: any;
    };
    left: {
      status: number;
      body?: any;
    };
    right: {
      status: number;
      body?: any;
    };
  };
}>): string {
  return endpoints.map(endpoint => {
    const yamlLines = [
      `- method: ${endpoint.method}`,
      `  path: ${endpoint.path}`,
      `  status: ${endpoint.status}`
    ];

    if (endpoint.body !== undefined) {
      if (endpoint.body === null) {
        yamlLines.push('  body: null');
      } else if (typeof endpoint.body === 'object') {
        yamlLines.push('  body:');
        yamlLines.push(...formatObjectAsYaml(endpoint.body, 2));
      } else {
        yamlLines.push(`  body: ${JSON.stringify(endpoint.body)}`);
      }
    }

    if (endpoint.delayMs !== undefined) {
      yamlLines.push(`  delayMs: ${endpoint.delayMs}`);
    }

    if (endpoint.headers) {
      yamlLines.push('  headers:');
      Object.entries(endpoint.headers).forEach(([key, value]) => {
        yamlLines.push(`    ${key}: "${value}"`);
      });
    }

    if (endpoint.guard) {
      yamlLines.push('  guard:');
      yamlLines.push('    condition:');
      yamlLines.push(`      field: ${endpoint.guard.condition.field}`);
      yamlLines.push(`      operator: ${endpoint.guard.condition.operator}`);
      if (endpoint.guard.condition.value !== undefined) {
        yamlLines.push(`      value: ${JSON.stringify(endpoint.guard.condition.value)}`);
      }
      yamlLines.push('    left:');
      yamlLines.push(`      status: ${endpoint.guard.left.status}`);
      if (endpoint.guard.left.body !== undefined) {
        if (typeof endpoint.guard.left.body === 'object') {
          yamlLines.push('      body:');
          yamlLines.push(...formatObjectAsYaml(endpoint.guard.left.body, 4));
        } else {
          yamlLines.push(`      body: ${JSON.stringify(endpoint.guard.left.body)}`);
        }
      }
      yamlLines.push('    right:');
      yamlLines.push(`      status: ${endpoint.guard.right.status}`);
      if (endpoint.guard.right.body !== undefined) {
        if (typeof endpoint.guard.right.body === 'object') {
          yamlLines.push('      body:');
          yamlLines.push(...formatObjectAsYaml(endpoint.guard.right.body, 4));
        } else {
          yamlLines.push(`      body: ${JSON.stringify(endpoint.guard.right.body)}`);
        }
      }
    }

    return yamlLines.join('\n');
  }).join('\n\n');
}

function formatObjectAsYaml(obj: any, indentLevel: number): string[] {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      lines.push(`${indent}[]`);
    } else {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          lines.push(`${indent}- `);
          const itemLines = formatObjectAsYaml(item, indentLevel + 1);
          itemLines.forEach((line, lineIndex) => {
            if (lineIndex === 0) {
              lines[lines.length - 1] += line.trim();
            } else {
              lines.push(`${indent}  ${line.trim()}`);
            }
          });
        } else {
          lines.push(`${indent}- ${JSON.stringify(item)}`);
        }
      });
    }
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === null) {
        lines.push(`${indent}${key}: null`);
      } else if (typeof value === 'object') {
        lines.push(`${indent}${key}:`);
        lines.push(...formatObjectAsYaml(value, indentLevel + 1));
      } else {
        lines.push(`${indent}${key}: ${JSON.stringify(value)}`);
      }
    });
  }

  return lines;
}
