import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { createYamlMockFile } from '../../utils';

describe('Query Parameter Templating', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  it('should interpolate single query parameter', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'GET',
      path: '/search',
      status: 200,
      body: { 
        query: '{{query.q}}',
        found: true 
      }
    }]);

    serverManager.createMockFile(context.mockDir, 'query.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const response = await context.client.get('/query/search?q=test');

    expect(response.status).toBe(200);
    expect(response.body.query).toBe('test');
    expect(response.body.found).toBe(true);
  });
});
