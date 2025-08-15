import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('INVALID_YAML_HANDLING', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should handle invalid YAML syntax gracefully', async () => {
    context = await createTestContext();
    
    // Create valid initial file
    const validYaml = createYamlMockFile([
      {
        method: 'GET',
        path: '/valid',
        status: 200,
        body: { message: 'valid' }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'valid.yaml', validYaml);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Verify valid endpoint works
    const validResponse = await context.client.get('/valid');
    expect(validResponse.status).toBe(200);
    
    // Add file with invalid YAML syntax
    const invalidYamlPath = join(context.mockDir, 'invalid.yaml');
    writeFileSync(invalidYamlPath, `
      - method: GET
        path: /invalid
        status: 200
        body:
          message: "missing quote
    `);
    
    // Wait for file processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Valid endpoint should still work despite invalid file
    const stillValidResponse = await context.client.get('/valid');
    expect(stillValidResponse.status).toBe(200);
    
    // Invalid endpoint should not be available
    try {
      const invalidResponse = await context.client.get('/invalid');
      // If this succeeds, it means the server is running but endpoint doesn't exist
      // which would be a 404, so let's check the status
      expect(invalidResponse.status).toBe(404);
    } catch (error: any) {
      // If it throws, it should be a 404 error
      expect(error.message).toContain('404');
    }
    
    // Clean up
    try {
      unlinkSync(invalidYamlPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  });
});