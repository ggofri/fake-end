import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('SUSTAINED_LOAD_STABILITY', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should maintain stability during sustained load', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'GET',
        path: '/api/load',
        status: 200,
        body: {
          message: 'Load test response',
          serverTime: new Date().toISOString()
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Run sustained load for a reasonable duration
    const testDuration = 5000; // 5 seconds
    const requestInterval = 100; // Request every 100ms
    const startTime = Date.now();
    const responses: any[] = [];
    
    while (Date.now() - startTime < testDuration) {
      try {
        const response = await context.client.get('/api/load');
        responses.push({ success: true, status: response.status });
      } catch (error) {
        responses.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      
      await new Promise(resolve => setTimeout(resolve, requestInterval));
    }
    
    // Analyze results
    const successfulResponses = responses.filter(r => r.success);
    const failedResponses = responses.filter(r => !r.success);
    
    // Should have high success rate (>95%)
    const successRate = successfulResponses.length / responses.length;
    expect(successRate).toBeGreaterThan(0.95);
    
    // Should have made multiple requests
    expect(responses.length).toBeGreaterThan(10);
    
    // Failures should be minimal
    expect(failedResponses.length).toBeLessThan(responses.length * 0.05);
  });
});