import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { createYamlMockFile } from '../../utils';

describe('HTTP DELETE Method', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  it('should handle DELETE request with 204 status and null body', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'DELETE',
      path: '/item',
      status: 204,
      body: null
    }]);
    
    serverManager.createMockFile(context.mockDir, 'delete.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const response = await context.client.delete('/delete/item');
    
    expect(response.status).toBe(204);
    expect(response.body).toBe('');
  });

  it('should handle DELETE request without body field', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'DELETE',
      path: '/item',
      status: 204
      
    }]);
    
    serverManager.createMockFile(context.mockDir, 'delete2.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const response = await context.client.delete('/delete2/item');
    
    expect(response.status).toBe(204);
    expect(response.body).toBe('');
  });
});
