import { createTestContext, cleanupTestContext, createYamlMockFile, restartServerWithMocks, TestContext } from '../../utils';
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
    
    await restartServerWithMocks(context, {
      'api.yaml': yamlContent
    });
    
    const validResponse = await context.client.post('/api/robust', { valid: true });
    expect(validResponse.status).toBe(200);
    
    try {
      await context.client.request('/api/robust', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error(err)
    }
    
    const recoveryResponse = await context.client.post('/api/robust', { recovery: true });
    expect(recoveryResponse.status).toBe(200);
  });
});
