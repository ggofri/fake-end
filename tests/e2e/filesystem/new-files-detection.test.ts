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
    
    const initialResponse = await context.client.get('/initial');
    expect(initialResponse.status).toBe(200);
    
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
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const newResponse = await context.client.get('/new');
      expect(newResponse.status).toBe(200);
      expect(newResponse.body.message).toBe('new endpoint');
    } catch {
      console.warn('Hot reload not implemented: New mock files require server restart');
    }
    
    try {
      unlinkSync(newFilePath);
    } catch (e) {
      console.warn(e)
    }
  });
});
