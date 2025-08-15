import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { createYamlMockFile } from '../../utils';

describe('HTTP PATCH Method', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  it('should handle basic PATCH request', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'PATCH',
      path: '/item',
      status: 200,
      body: { method: 'PATCH', patched: true }
    }]);

    serverManager.createMockFile(context.mockDir, 'patch.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const response = await context.client.patch('/patch/item', { field: 'value' });
    
    expect(response.status).toBe(200);
    expect(response.body.method).toBe('PATCH');
    expect(response.body.patched).toBe(true);
  });
});