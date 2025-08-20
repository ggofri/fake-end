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
        delayMs: 50 
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.restart();
    
    const requests = Array.from({ length: 20 }, () =>
      context.client.get('/api/concurrent')
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Concurrent request handled');
      expect(response.body.id).toBeDefined();
    });
    
    expect(totalTime).toBeLessThan(5000); 
  });
});
