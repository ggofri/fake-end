import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('BASIC_INTERFACE_LOADING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should load TypeScript interface files as mock endpoints', async () => {
    context = await createTestContext();
    
    // Create a TypeScript interface file with @mock comment
    const tsContent = `
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// @mock
export default User;`;
    
    const tsFilePath = join(context.mockDir, 'users.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Should generate a mock endpoint from the interface
    const response = await context.client.get('/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    // Response should have properties matching the interface
    if (Array.isArray(response.body)) {
      const user = response.body[0];
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.isActive).toBe('boolean');
    } else {
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.name).toBe('string');
      expect(typeof response.body.email).toBe('string');
      expect(typeof response.body.isActive).toBe('boolean');
    }
  });
});