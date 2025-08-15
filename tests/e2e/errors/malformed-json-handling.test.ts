import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('MALFORMED_JSON_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle malformed JSON in request body gracefully', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/api/json-endpoint',
        status: 200,
        body: {
          received: true,
          data: '{{body}}'
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Valid JSON should work
    const validResponse = await context.client.post('/api/json-endpoint', { valid: true });
    expect(validResponse.status).toBe(200);
    
    // Malformed JSON should be handled gracefully
    try {
      await context.client.request('/api/json-endpoint', {
        method: 'POST',
        body: '{"invalid": json}',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // Server should handle this gracefully without crashing
      expect(error).toBeDefined();
    }
    
    // Server should still work after malformed request
    const recoveryResponse = await context.client.post('/api/json-endpoint', { recovery: true });
    expect(recoveryResponse.status).toBe(200);
  });
});