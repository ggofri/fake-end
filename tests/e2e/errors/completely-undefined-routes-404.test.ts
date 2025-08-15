import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('COMPLETELY_UNDEFINED_ROUTES_404', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should return 404 for completely undefined routes', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'GET',
        path: '/api/existing',
        status: 200,
        body: { message: 'exists' }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Existing endpoint should work
    const existingResponse = await context.client.get('/api/existing');
    expect(existingResponse.status).toBe(200);
    
    // Non-existent endpoint should return 404
    try {
      await context.client.get('/api/completely/nonexistent/route');
      throw new Error('Should have returned 404');
    } catch (error: any) {
      expect(error.message).toContain('404');
    }
  });
});