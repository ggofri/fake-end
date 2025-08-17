import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('BODY_AWARE_MOCK_FUNCTIONS', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should generate mock data that accesses request body', async () => {
    context = await createTestContext({ dynamicMocks: true });
    
    const tsContent = `
interface UserProfile {
  /** @mock (body) => body.username */
  username: string;
  
  /** @mock (body) => body.email || "default@example.com" */
  email: string;
  
  /** @mock (body) => body.role || "user" */
  role: string;
  
  /** @mock () => Date.now() */
  timestamp: number;
}

// @mock
export default UserProfile;`;
    
    const tsFilePath = join(context.mockDir, 'user-profile.post.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir, dynamicMocks: true });
    
    const requestBody = {
      username: 'johndoe',
      email: 'john@example.com',
      role: 'admin'
    };
    
    const response = await context.client.post('/user-profile', requestBody);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    expect(response.body.username).toBe('johndoe');
    expect(response.body.email).toBe('john@example.com');
    expect(response.body.role).toBe('admin');
    expect(typeof response.body.timestamp).toBe('number');
  });

  it('should fallback gracefully when body is not provided', async () => {
    context = await createTestContext({ dynamicMocks: true });
    
    const tsContent = `
interface UserProfile {
  /** @mock (body) => body?.username || "anonymous" */
  username: string;
  
  /** @mock (body) => body?.email || "default@example.com" */
  email: string;
  
  /** @mock () => "user" */
  role: string;
}

// @mock
export default UserProfile;`;
    
    const tsFilePath = join(context.mockDir, 'user-profile-fallback.post.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir, dynamicMocks: true });
    
    const response = await context.client.post('/user-profile-fallback', {});
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    expect(response.body.username).toBe('anonymous');
    expect(response.body.email).toBe('default@example.com');
    expect(response.body.role).toBe('user');
  });

  it('should work with complex body manipulation', async () => {
    context = await createTestContext({ dynamicMocks: true });
    
    const tsContent = `
interface OrderSummary {
  /** @mock (body) => body.orderId */
  orderId: string;
  
  /** @mock (body) => body.items?.length || 0 */
  itemCount: number;
  
  /** @mock (body) => body.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0 */
  totalAmount: number;
  
  /** @mock (body) => body.customerInfo?.name || "Guest" */
  customerName: string;
}

// @mock
export default OrderSummary;`;
    
    const tsFilePath = join(context.mockDir, 'order-summary.post.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir, dynamicMocks: true });
    
    const requestBody = {
      orderId: 'ORDER-123',
      items: [
        { price: 10.50, quantity: 2 },
        { price: 25.00, quantity: 1 }
      ],
      customerInfo: {
        name: 'John Doe'
      }
    };
    
    const response = await context.client.post('/order-summary', requestBody);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    expect(response.body.orderId).toBe('ORDER-123');
    expect(response.body.itemCount).toBe(2);
    expect(response.body.totalAmount).toBe(46); 
    expect(response.body.customerName).toBe('John Doe');
  });

  it('should work alongside regular mock functions', async () => {
    context = await createTestContext({ dynamicMocks: true });
    
    const tsContent = `
interface MixedResponse {
  /** @mock (body) => body.username */
  username: string;
  
  /** @mock () => Math.floor(Math.random() * 1000) + 1 */
  sessionId: number;
  
  /** @mock "active" */
  status: string;
  
  /** @mock (body) => body.preferences || {} */
  preferences: Record<string, unknown>;
}

// @mock
export default MixedResponse;`;
    
    const tsFilePath = join(context.mockDir, 'mixed-response.post.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir, dynamicMocks: true });
    
    const requestBody = {
      username: 'testuser',
      preferences: { theme: 'dark', notifications: true }
    };
    
    const response = await context.client.post('/mixed-response', requestBody);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    expect(response.body.username).toBe('testuser');
    expect(typeof response.body.sessionId).toBe('number');
    expect(response.body.sessionId).toBeGreaterThan(0);
    expect(response.body.status).toBe('active');
    expect(response.body.preferences).toEqual({ theme: 'dark', notifications: true });
  });
});
