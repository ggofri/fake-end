import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('POST_REQUESTS_CONCURRENT_LOAD', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle POST requests with body data under concurrent load', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/api/data',
        status: 201,
        body: {
          processed: true,
          receivedData: '{{body}}',
          timestamp: new Date().toISOString()
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Make concurrent POST requests with different data
    const requests = Array.from({ length: 10 }, (_, i) =>
      context.client.post('/api/data', { id: i, name: `Item ${i}` })
    );
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed with correct data
    responses.forEach((response, index) => {
      expect(response.status).toBe(201);
      expect(response.body.processed).toBe(true);
      expect(response.body.receivedData.id).toBe(index);
      expect(response.body.receivedData.name).toBe(`Item ${index}`);
    });
  });
});