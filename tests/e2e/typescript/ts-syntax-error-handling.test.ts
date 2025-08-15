import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('TS_SYNTAX_ERROR_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle TypeScript files with syntax errors gracefully', async () => {
    context = await createTestContext();
    
    // Create valid TypeScript file first
    const validTsContent = `
interface ValidInterface {
  id: number;
  name: string;
}

// @mock
export default ValidInterface;`;
    
    writeFileSync(join(context.mockDir, 'valid.ts'), validTsContent);
    
    // Create TypeScript file with syntax error
    const invalidTsContent = `
interface InvalidInterface {
  id: number
  name: string // Missing semicolon
  // Missing closing brace`;
    
    writeFileSync(join(context.mockDir, 'invalid.ts'), invalidTsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Valid endpoint should still work
    const validResponse = await context.client.get('/valid');
    expect(validResponse.status).toBe(200);
    
    // Invalid endpoint should return 404 (not crash server)
    try {
      await context.client.get('/invalid');
      throw new Error('Should have returned 404');
    } catch (error: any) {
      expect(error.message).toContain('404');
    }
  });
});