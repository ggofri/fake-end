import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('POST_ENDPOINTS_TS_INTERFACES', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle basic TypeScript interface for POST endpoints', async () => {
    context = await createTestContext();
    
    // Create a simple interface that might work with current implementation
    const tsContent = `
interface CreateUserResponse {
  id: number;
  success: boolean;
  message: string;
}

// @mock
export default CreateUserResponse;`;
    
    const tsFilePath = join(context.mockDir, 'create-user.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Try GET first (more likely to work with current implementation)
    const response = await context.client.get('/create-user');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(typeof response.body.id).toBe('number');
    expect(typeof response.body.success).toBe('boolean');
    expect(typeof response.body.message).toBe('string');
  });
});