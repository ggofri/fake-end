import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('MULTIPLE_ENDPOINTS_EFFICIENCY', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle multiple endpoints efficiently', async () => {
    context = await createTestContext();
    
    const endpoints = [
      { method: 'GET', path: '/api/users', body: { users: [] } },
      { method: 'GET', path: '/api/products', body: { products: [] } },
      { method: 'GET', path: '/api/orders', body: { orders: [] } },
      { method: 'POST', path: '/api/users', body: { created: true } },
      { method: 'POST', path: '/api/products', body: { created: true } }
    ];
    
    const yamlContent = createYamlMockFile(
      endpoints.map(ep => ({ ...ep, status: 200 }))
    );
    
    serverManager.createMockFile(context.mockDir, 'api.yaml', yamlContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    const requests = [
      context.client.get('/api/users'),
      context.client.get('/api/products'),
      context.client.get('/api/orders'),
      context.client.post('/api/users', { name: 'John' }),
      context.client.post('/api/products', { name: 'Widget' })
    ];
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    expect(responses[0].body).toEqual({ users: [] });
    expect(responses[1].body).toEqual({ products: [] });
    expect(responses[2].body).toEqual({ orders: [] });
    
    expect(responses[3].body).toEqual({ created: true });
    expect(responses[4].body).toEqual({ created: true });
  });
});
