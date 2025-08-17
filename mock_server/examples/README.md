# TypeScript Interface Examples

This directory contains examples demonstrating the powerful features available in fake-end for TypeScript interfaces.

## JSDoc Mock Annotations

Use `@mock` annotations to provide custom values for specific properties instead of auto-generated ones:

```typescript
interface Product {
  /** @mock "12345" */
  id: number;
  
  /** @mock "Premium Wireless Headphones" */
  name: string;
  
  /** @mock "299.99" */
  price: number;
  
  /** @mock "true" */
  inStock: boolean;
  
  /** @mock "2024-01-15T10:30:00Z" */
  createdAt: string;
  
  /** @mock "['electronics', 'audio', 'wireless']" */
  tags: string[];
  
  /** @mock "{'color': 'black', 'warranty': '2 years'}" */
  metadata: Record<string, unknown>;
}
```

## Guard Functions

Use `@guard` annotations to add conditional logic that validates request data:

```typescript
/**
 * @guard {
 *   "condition": { "field": "price", "operator": "not_equals", "value": 0 },
 *   "left": { "status": 400, "body": { "error": "Invalid price" } },
 *   "right": { "status": 201, "body": { "message": "Success" } }
 * }
 */
interface CreateProductResponse {
  // ...
}
```

## Available Guard Operators

- `equals` - Field value equals the specified value
- `not_equals` - Field value does not equal the specified value  
- `contains` - String contains substring or array contains value
- `not_contains` - String/array does not contain value
- `exists` - Field exists in request body
- `not_exists` - Field does not exist in request body

## Nested Field Access

Guards support nested field paths using dot notation:

```typescript
/**
 * @guard {
 *   "condition": { "field": "user.role", "operator": "equals", "value": "admin" },
 *   "left": { "status": 403, "body": { "error": "Forbidden" } },
 *   "right": { "status": 200, "body": { "message": "Admin access granted" } }
 * }
 */
```

## Mock Value Types

Mock annotations support various data types:

```typescript
interface ExampleTypes {
  /** @mock "42" */
  numberField: number;
  
  /** @mock "hello world" */
  stringField: string;
  
  /** @mock "true" */
  booleanField: boolean;
  
  /** @mock "null" */
  nullableField: string | null;
  
  /** @mock "['item1', 'item2', 'item3']" */
  arrayField: string[];
  
  /** @mock "{'key': 'value', 'nested': {'prop': 123}}" */
  objectField: Record<string, unknown>;
  
  /** @mock "2024-01-15T10:30:00Z" */
  dateField: string;
  
  /** @mock "https://example.com/image.jpg" */
  urlField: string;
  
  /** @mock "user@example.com" */
  emailField: string;
}
```

## Combined Usage

You can combine both guard functions and mock annotations in the same interface:

```typescript
/**
 * Order creation with validation and custom mock data
 * @guard {
 *   "condition": { "field": "amount", "operator": "not_equals", "value": 0 },
 *   "left": { "status": 400, "body": { "error": "Invalid amount" } },
 *   "right": { "status": 201, "body": { "id": "order_123", "status": "confirmed" } }
 * }
 */
interface CreateOrderResponse {
  /** @mock "order_abc123" */
  id: string;
  
  /** @mock "confirmed" */
  status: string;
  
  /** @mock "99.99" */
  amount: number;
  
  /** @mock "2024-01-16T12:00:00Z" */
  createdAt: string;
}
```

## File Examples

- `user-profile.get.ts` - Comprehensive mock annotations showcase
- `order-create.post.ts` - Guard functions combined with mock data
- Check the other `.ts` files in this directory for more examples!
