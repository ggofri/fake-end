import { createTestContext, cleanupTestContext, createYamlMockFile, restartServerWithMocks, TestContext } from '../../utils';
import { serverManager } from '../../utils';

describe('GUARD_FUNCTION', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should return left response when guard condition is true', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/auth',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'role',
            operator: 'equals',
            value: 'admin'
          },
          left: {
            status: 403,
            body: { error: 'Access denied' }
          },
          right: {
            status: 200,
            body: { message: 'Admin access granted' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'auth.yaml': yamlContent });
    
    const response = await context.client.post('/auth', {
      role: 'admin',
      username: 'testuser'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Admin access granted');
  });

  it('should return right response when guard condition is false', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/auth',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'role',
            operator: 'equals',
            value: 'admin'
          },
          left: {
            status: 403,
            body: { error: 'Access denied' }
          },
          right: {
            status: 200,
            body: { message: 'Admin access granted' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'auth.yaml': yamlContent });
    
    const response = await context.client.post('/auth', {
      role: 'user',
      username: 'testuser'
    });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied');
  });

  it('should handle not_equals operator correctly', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/status',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'status',
            operator: 'not_equals',
            value: 'banned'
          },
          left: {
            status: 403,
            body: { error: 'User is banned' }
          },
          right: {
            status: 200,
            body: { message: 'User is active' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'status.yaml': yamlContent });
    
    const response = await context.client.post('/status', {
      status: 'active',
      userId: '123'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User is active');
  });

  it('should handle contains operator for strings', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/filter',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'message',
            operator: 'contains',
            value: 'spam'
          },
          left: {
            status: 400,
            body: { error: 'Message rejected' }
          },
          right: {
            status: 400,
            body: { error: 'Contains spam' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'filter.yaml': yamlContent });
    
    const response = await context.client.post('/filter', {
      message: 'This is a spam message',
      userId: '123'
    });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Contains spam');
  });

  it('should handle exists operator', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/check',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'apiKey',
            operator: 'exists'
          },
          left: {
            status: 401,
            body: { error: 'API key required' }
          },
          right: {
            status: 200,
            body: { message: 'API key provided' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'check.yaml': yamlContent });
    
    const response = await context.client.post('/check', {
      apiKey: 'abc123',
      data: 'test'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('API key provided');
  });

  it('should handle nested field paths', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/nested',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'user.permissions.admin',
            operator: 'equals',
            value: true
          },
          left: {
            status: 403,
            body: { error: 'Not admin' }
          },
          right: {
            status: 200,
            body: { message: 'Admin access' }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'nested.yaml': yamlContent });
    
    const response = await context.client.post('/nested', {
      user: {
        id: '123',
        permissions: {
          admin: true,
          read: true
        }
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Admin access');
  });

  it('should work with parameter interpolation', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/users',
        status: 200,
        body: { message: 'Default response' },
        guard: {
          condition: {
            field: 'email',
            operator: 'contains',
            value: '@admin.com'
          },
          left: {
            status: 403,
            body: { error: 'Regular users not allowed' }
          },
          right: {
            status: 201,
            body: {
              id: 123,
              email: '{{body.email}}',
              role: 'admin',
              message: 'Admin user created'
            }
          }
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'users.yaml': yamlContent });
    
    const response = await context.client.post('/users', {
      email: 'test@admin.com',
      name: 'Admin User'
    });
    
    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@admin.com');
    expect(response.body.role).toBe('admin');
    expect(response.body.message).toBe('Admin user created');
  });

  it('should work without guard function (normal operation)', async () => {
    context = await createTestContext();
    
    const yamlContent = createYamlMockFile([
      {
        method: 'POST',
        path: '/normal',
        status: 200,
        body: {
          message: 'Normal response',
          data: '{{body.data}}'
        }
      }
    ]);
    
    await restartServerWithMocks(context, { 'normal.yaml': yamlContent });
    
    const response = await context.client.post('/normal', {
      data: 'test data'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Normal response');
    expect(response.body.data).toBe('test data');
  });
});
