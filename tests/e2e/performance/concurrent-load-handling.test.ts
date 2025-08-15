import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('CONCURRENT_LOAD_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle multiple concurrent requests without failures', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'GET',
        path: '/api/concurrent',
        status: 200,
        body: {
          message: 'Concurrent request handled',
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        },
        delayMs: 50 // Small realistic delay
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Make 20 concurrent requests (realistic load)
    const requests = Array.from({ length: 20 }, () =>
      context.client.get('/api/concurrent')
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Concurrent request handled');
      expect(response.body.id).toBeDefined();
    });
    
    // Should handle concurrency efficiently (not 20 * delay time)
    expect(totalTime).toBeLessThan(5000); // Should be much less than 20 * 50ms + overhead
  });
});