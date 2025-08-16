import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('INVALID_YAML_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle invalid YAML syntax gracefully', async () => {
    context = await createTestContext();
    
    const validYaml = createYamlMockFile([
      {
        method: 'GET',
        path: '/valid',
        status: 200,
        body: { message: 'valid' }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'valid.yaml', validYaml);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    const validResponse = await context.client.get('/valid');
    expect(validResponse.status).toBe(200);
    
    const invalidYamlPath = join(context.mockDir, 'invalid.yaml');
    writeFileSync(invalidYamlPath, `
      - method: GET
        path: /invalid
        status: 200
        body:
          message: "missing quote
    `);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stillValidResponse = await context.client.get('/valid');
    expect(stillValidResponse.status).toBe(200);
    
    try {
      const invalidResponse = await context.client.get('/invalid');
      
      expect(invalidResponse.status).toBe(404);
    } catch (error: any) {
      
      expect(error.message).toContain('404');
    }
    
    try {
      unlinkSync(invalidYamlPath);
    } catch (e) {
      console.error(e)
    }
  });
});
