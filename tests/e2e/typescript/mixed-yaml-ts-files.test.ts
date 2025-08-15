import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('MIXED_YAML_TS_FILES', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle both YAML and TypeScript mock files in same directory', async () => {
    context = await createTestContext();
    
    // Create YAML mock file
    const yamlContent = `- method: GET
  path: /health
  status: 200
  body:
    status: "ok"
    timestamp: "2023-01-01T00:00:00Z"`;
    
    writeFileSync(join(context.mockDir, 'health.yaml'), yamlContent);
    
    // Create TypeScript interface file
    const tsContent = `
interface ApiInfo {
  version: string;
  name: string;
  description: string;
}

// @mock
export default ApiInfo;`;
    
    writeFileSync(join(context.mockDir, 'api-info.ts'), tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Both endpoints should work
    const healthResponse = await context.client.get('/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe('ok');
    
    const apiInfoResponse = await context.client.get('/api-info');
    expect(apiInfoResponse.status).toBe(200);
    expect(typeof apiInfoResponse.body.version).toBe('string');
    expect(typeof apiInfoResponse.body.name).toBe('string');
    expect(typeof apiInfoResponse.body.description).toBe('string');
  });
});