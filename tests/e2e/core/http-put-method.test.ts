import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { createYamlMockFile } from '../../utils';

describe('HTTP PUT Method', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  it('should handle basic PUT request', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'PUT',
      path: '/item',
      status: 200,
      body: { method: 'PUT', updated: true }
    }]);

    serverManager.createMockFile(context.mockDir, 'put.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const response = await context.client.put('/put/item', { data: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body.method).toBe('PUT');
    expect(response.body.updated).toBe(true);
  });
});
