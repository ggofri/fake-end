import { createTestContext, cleanupTestContext, createYamlMockFile, restartServerWithMocks, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('BASIC_HTTP_POST', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle POST requests with body interpolation', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/users',
        status: 201,
        body: {
          id: 123,
          name: '{{body.name}}',
          email: '{{body.email}}',
          created: true
        }
      }
    ]);
    
    await restartServerWithMocks(context, {
      'api.yaml': yamlContent
    });
    
    const response = await context.client.post('/api/users', {
      name: 'Alice',
      email: 'alice@example.com'
    });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Alice');
    expect(response.body.email).toBe('alice@example.com');
    expect(response.body.created).toBe(true);
  });
});
