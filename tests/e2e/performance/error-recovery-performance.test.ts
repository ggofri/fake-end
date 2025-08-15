import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('ERROR_RECOVERY_PERFORMANCE', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should recover gracefully from error conditions', async () => {
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
    
    // Mix of valid and problematic requests
    const requests = [
      // Valid requests
      context.client.post('/api/robust', { valid: true }),
      context.client.post('/api/robust', { data: 'test' }),
      
      // Problematic request (malformed JSON)
      context.client.request('/api/robust', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => ({ error: true, message: e.message })),
      
      // Valid request after problematic one
      context.client.post('/api/robust', { recovery: true }),
    ];
    
    const responses = await Promise.all(requests);
    
    // Valid requests should succeed
    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(200);
    expect(responses[3].status).toBe(200);
    
    // Server should continue functioning after errors
    const finalResponse = await context.client.post('/api/robust', { final: true });
    expect(finalResponse.status).toBe(200);
  });
});