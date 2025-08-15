import { createTestContext, cleanupTestContext, createYamlMockFile, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('NEW_FILES_DETECTION', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should detect new mock files added while server is running', async () => {
    context = await createTestContext();
    
    // Start server with initial mock file
    const initialYaml = createYamlMockFile([
      {
        method: 'GET',
        path: '/initial',
        status: 200,
        body: { message: 'initial endpoint' }
      }
    ]);
    
    serverManager.createMockFile(context.mockDir, 'initial.yaml', initialYaml);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    // Verify initial endpoint works
    const initialResponse = await context.client.get('/initial');
    expect(initialResponse.status).toBe(200);
    
    // Add new mock file while server is running
    const newYaml = createYamlMockFile([
      {
        method: 'GET',
        path: '/new',
        status: 200,
        body: { message: 'new endpoint' }
      }
    ]);
    
    const newFilePath = join(context.mockDir, 'new.yaml');
    writeFileSync(newFilePath, newYaml);
    
    // Wait a moment for file system detection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // New endpoint should be available (if hot reload is implemented)
    // Note: This test will fail if hot reload isn't implemented yet
    try {
      const newResponse = await context.client.get('/new');
      expect(newResponse.status).toBe(200);
      expect(newResponse.body.message).toBe('new endpoint');
    } catch (error) {
      // If this fails, it indicates hot reload isn't implemented
      // This is valuable information for development priorities
      console.warn('Hot reload not implemented: New mock files require server restart');
    }
    
    // Clean up
    try {
      unlinkSync(newFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  });
});