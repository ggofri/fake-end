import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('SERVER_RECOVERY_FROM_ERRORS', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should recover gracefully from invalid requests', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/api/robust',
        status: 200,
        body: {
          message: 'Request processed',
          data: '{{body}}'
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Valid request should work
    const validResponse = await context.client.post('/api/robust', { valid: true });
    expect(validResponse.status).toBe(200);
    
    // Invalid JSON request
    try {
      await context.client.request('/api/robust', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // Server should handle this gracefully
    }
    
    // Server should still function after invalid request
    const recoveryResponse = await context.client.post('/api/robust', { recovery: true });
    expect(recoveryResponse.status).toBe(200);
  });
});