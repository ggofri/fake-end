import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('MISSING_BODY_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle requests with missing expected body', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/api/expects-body',
        status: 200,
        body: {
          name: '{{body.name}}',
          email: '{{body.email}}',
          processed: true
        }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    const completeResponse = await context.client.post('/api/expects-body', {
      name: 'John',
      email: 'john@example.com'
    });
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.name).toBe('John');
    
    const emptyResponse = await context.client.post('/api/expects-body', {});
    expect(emptyResponse.status).toBe(200);
    
    expect(completeResponse.body.processed).toBe(true);
  });
});
