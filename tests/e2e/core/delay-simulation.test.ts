import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { createYamlMockFile } from '../../utils';

describe('Response Delay Simulation', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  it('should delay response by configured milliseconds', async () => {
    const yamlContent = createYamlMockFile([{
      method: 'GET',
      path: '/slow',
      status: 200,
      body: { message: 'delayed response' },
      delayMs: 300
    }]);

    serverManager.createMockFile(context.mockDir, 'delay.yaml', yamlContent);
    await context.server.restart(context.mockDir);

    const startTime = Date.now();
    const response = await context.client.get('/delay/slow');
    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('delayed response');
    expect(duration).toBeGreaterThan(250);
    expect(duration).toBeLessThan(400);
  });
});
