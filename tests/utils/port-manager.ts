import { createHash } from 'crypto';

const PORT_RANGES: Record<string, number> = {
  'core-functionality.test.ts': 6000,
  'error-scenarios.test.ts': 6100,
  'performance-critical.test.ts': 6200,
  'file-watching.test.ts': 6300,
  'cli-core.test.ts': 6400,
  'typescript-interfaces.test.ts': 6500,
  
  'basic-http-get.test.ts': 6600,
  'basic-http-post.test.ts': 6650,
  'undefined-routes-404.test.ts': 6700,
  'concurrent-requests.test.ts': 6750,
  'server-recovery-from-errors.test.ts': 6800,
  
  'completely-undefined-routes-404.test.ts': 6850,
  'unsupported-methods-404.test.ts': 6900,
  'malformed-json-handling.test.ts': 6950,
  'missing-body-handling.test.ts': 7000,
  'rapid-requests-stability.test.ts': 7050,
  
  'new-files-detection.test.ts': 7100,
  'file-modifications-hotreload.test.ts': 7150,
  'invalid-yaml-handling.test.ts': 7200,
  
  'concurrent-load-handling.test.ts': 7250,
  'post-requests-concurrent-load.test.ts': 7300,
  'sustained-load-stability.test.ts': 7350,
  'error-recovery-performance.test.ts': 7400,
  'multiple-endpoints-efficiency.test.ts': 7450,
  
  'basic-interface-loading.test.ts': 7500,
  'jsdoc-mock-generation.test.ts': 7550,
  'post-endpoints-ts-interfaces.test.ts': 7600,
  'mixed-yaml-ts-files.test.ts': 7650,
  'ts-syntax-error-handling.test.ts': 7700,
  'no-mock-comment-handling.test.ts': 7750,
  
  'http-put-method.test.ts': 7800,
  'http-patch-method.test.ts': 7850,
  'http-delete-method.test.ts': 7900,
  'query-parameters.test.ts': 7950,
  'delay-simulation.test.ts': 8000
};

export function getPortForTestFile(): number {
  const stack = new Error().stack || '';
  const testFileMatch = stack.match(/([^/\\]+\.test\.ts)/);
  const testFileName = testFileMatch ? testFileMatch[1] : 'unknown.test.ts';
  
  const basePort = PORT_RANGES[testFileName as keyof typeof PORT_RANGES] || 7000;
  
  const offset = Math.floor(Math.random() * 50);
  
  return basePort + offset;
}

export function getPortForTest(testName: string): number {
  const stack = new Error().stack || '';
  const testFileMatch = stack.match(/([^/\\]+\.test\.ts)/);
  const testFileName = testFileMatch ? testFileMatch[1] : 'unknown.test.ts';
  
  const basePort = PORT_RANGES[testFileName as keyof typeof PORT_RANGES] || 7000;
  
  const hash = createHash('md5').update(testName).digest('hex');
  const offset = parseInt(hash.substring(0, 2), 16) % 50;
  
  return basePort + offset;
}
