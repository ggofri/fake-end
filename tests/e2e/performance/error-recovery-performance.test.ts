import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext, HttpResponse } from '../../utils';
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
    
    const requests = [
      
      context.client.post('/api/robust', { valid: true }),
      context.client.post('/api/robust', { data: 'test' }),
      
      context.client.request('/api/robust', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => ({ error: true, message: e.message })),
      
      context.client.post('/api/robust', { recovery: true }),
    ];

    const responses = await Promise.all(requests);

    const isHttpResponse = (response: object): response is HttpResponse => Object.prototype.hasOwnProperty.call(response, 'status')
    
    expect(isHttpResponse(responses[0]) && responses[0].status).toBe(200);
    expect(isHttpResponse(responses[1]) && responses[1].status).toBe(200);
    expect(isHttpResponse(responses[3]) && responses[3].status).toBe(200);
    
    const finalResponse = await context.client.post('/api/robust', { final: true });
    expect(finalResponse.status).toBe(200);
  });
});
