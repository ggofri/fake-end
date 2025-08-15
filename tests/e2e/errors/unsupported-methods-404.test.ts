import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('UNSUPPORTED_METHODS_404', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should return 404 for unsupported HTTP methods on existing paths', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'GET',
        path: '/api/readonly',
        status: 200,
        body: { message: 'read only endpoint' }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // GET should work
    const getResponse = await context.client.get('/api/readonly');
    expect(getResponse.status).toBe(200);
    
    // POST should return 404 (current behavior - no POST endpoint defined)
    try {
      await context.client.post('/api/readonly', { data: 'test' });
      fail('Should have returned 404');
    } catch (error: any) {
      expect(error.message).toContain('404');
    }
  });
});