import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('RAPID_REQUESTS_STABILITY', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle rapid successive requests without degradation', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'GET',
        path: '/api/rapid',
        status: 200,
        body: {
          timestamp: new Date().toISOString(),
          counter: Math.random()
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Make rapid requests
    const rapidRequests: Promise<any>[] = [];
    for (let i = 0; i < 20; i++) {
      rapidRequests.push(context.client.get('/api/rapid'));
    }
    
    const responses = await Promise.all(rapidRequests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.timestamp).toBeDefined();
    });
  });
});