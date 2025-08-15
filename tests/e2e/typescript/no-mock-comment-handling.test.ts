import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('NO_MOCK_COMMENT_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle TypeScript files without @mock comments', async () => {
    context = await createTestContext();
    
    // Create TypeScript file without @mock comment
    const tsContent = `
interface RegularInterface {
  id: number;
  data: string;
}

export default RegularInterface;`;
    
    writeFileSync(join(context.mockDir, 'regular.ts'), tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Should not create endpoint (no @mock comment)
    try {
      await context.client.get('/regular');
      throw new Error('Should have returned 404');
    } catch (error: any) {
      expect(error.message).toContain('404');
    }
  });
});