import { createTestContext, cleanupTestContext, TestContext } from '../../utils';
import { serverManager } from '../../utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('REALISTIC_MOCK_GENERATION', () => {
  let context: TestContext;

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  it('should generate realistic mock data automatically for common property names', async () => {
    context = await createTestContext();
    
    const tsContent = `
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  address: string;
  createdAt: string;
  isActive: boolean;
  rating: number;
  price: number;
}

// @mock
export default User;`;
    
    const tsFilePath = join(context.mockDir, 'users.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir });
    
    const response = await context.client.get('/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const user = Array.isArray(response.body) ? response.body[0] : response.body;
    
    expect(typeof user.id).toBe('number');
    expect(user.id).toBeGreaterThan(0);
    
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    
    expect(typeof user.firstName).toBe('string');
    expect(user.firstName).not.toBe('sample_firstName');
    
    expect(typeof user.lastName).toBe('string');
    expect(user.lastName).not.toBe('sample_lastName');
    
    expect(typeof user.age).toBe('number');
    expect(user.age).toBeGreaterThanOrEqual(18);
    expect(user.age).toBeLessThanOrEqual(100);
    
    expect(typeof user.phone).toBe('string');
    expect(user.phone).not.toBe('sample_phone');
    
    expect(typeof user.address).toBe('string');
    expect(user.address).not.toBe('sample_address');
    
    expect(typeof user.createdAt).toBe('string');
    expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    
    expect(typeof user.isActive).toBe('boolean');
    
    expect(typeof user.rating).toBe('number');
    expect(user.rating).toBeGreaterThanOrEqual(1);
    expect(user.rating).toBeLessThanOrEqual(5);
    
    expect(typeof user.price).toBe('number');
    expect(user.price).toBeGreaterThan(0);
  });

  it('should support custom @mock directives with faker.js functions', async () => {
    context = await createTestContext();
    
    const tsContent = `
interface Product {
  /** @mock faker.number.int({ min: 1000, max: 9999 }) */
  id: number;
  
  /** @mock faker.commerce.productName() */
  name: string;
  
  /** @mock faker.number.float({ min: 10, max: 500, fractionDigits: 2 }) */
  price: number;
  
  /** @mock faker.helpers.arrayElement(["electronics", "clothing", "books", "sports"]) */
  category: string;
  
  /** @mock faker.datatype.boolean() */
  inStock: boolean;
  
  /** @mock faker.lorem.paragraph() */
  description: string;
  
  /** @mock faker.date.past().toISOString() */
  createdAt: string;
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
    
    const product = Array.isArray(response.body) ? response.body[0] : response.body;
    
    expect(typeof product.id).toBe('number');
    expect(product.id).toBeGreaterThanOrEqual(1000);
    expect(product.id).toBeLessThanOrEqual(9999);
    
    expect(typeof product.name).toBe('string');
    expect(product.name).not.toBe('sample_name');
    
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThanOrEqual(10);
    expect(product.price).toBeLessThanOrEqual(500);
    
    expect(typeof product.category).toBe('string');
    expect(['electronics', 'clothing', 'books', 'sports']).toContain(product.category);
    
    expect(typeof product.inStock).toBe('boolean');
    
    expect(typeof product.description).toBe('string');
    expect(product.description.length).toBeGreaterThan(10);
    
    expect(typeof product.createdAt).toBe('string');
    expect(product.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should support dynamic faker functions that regenerate on each request', async () => {
    context = await createTestContext();
    
    const tsContent = `
interface RandomData {
  /** @mock faker.number.int({ min: 1, max: 1000000 }) */
  randomNumber: number;
  
  /** @mock faker.person.firstName() */
  randomName: string;
}

// @mock
export default RandomData;`;
    
    const tsFilePath = join(context.mockDir, 'random.ts');
    writeFileSync(tsFilePath, tsContent);
    
    await context.server.cleanup();
    context = await createTestContext({ mockDir: context.mockDir, dynamicMocks: true });
    
    const response1 = await context.client.get('/random');
    const response2 = await context.client.get('/random');
    
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    
    const data1 = Array.isArray(response1.body) ? response1.body[0] : response1.body;
    const data2 = Array.isArray(response2.body) ? response2.body[0] : response2.body;
    
    expect(data1.randomNumber).not.toBe(data2.randomNumber);
    expect(data1.randomName).not.toBe(data2.randomName);
  });
});
