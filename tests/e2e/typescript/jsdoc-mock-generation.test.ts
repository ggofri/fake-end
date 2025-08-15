import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('JSDOC_MOCK_GENERATION', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should generate realistic mock data from TypeScript interfaces with JSDoc', async () => {
    context = await createTestContext();
    
    // Create interface with JSDoc @mock annotations
    const tsContent = `
interface Product {
  /** @mock () => Math.floor(Math.random() * 1000) + 1 */
  id: number;
  
  /** @mock "Awesome Widget" */
  name: string;
  
  /** @mock 29.99 */
  price: number;
  
  /** @mock true */
  inStock: boolean;
  
  /** @mock "Electronics" */
  category: string;
}

// @mock
export default Product;`;
    
    const tsFilePath = join(context.mockDir, 'products.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    const response = await context.client.get('/products');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    // Should generate specific mock data from JSDoc comments
    const product = Array.isArray(response.body) ? response.body[0] : response.body;
    
    expect(typeof product.id).toBe('number');
    expect(product.id).toBeGreaterThan(0);
    expect(product.name).toBe('Awesome Widget');
    expect(product.price).toBe(29.99);
    expect(product.inStock).toBe(true);
    expect(product.category).toBe('Electronics');
  });
});