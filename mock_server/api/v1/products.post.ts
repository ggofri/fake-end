/**
 * @guard {
 *  "condition": {
 *    "field": "price",
 *    "operator": "not_equals",
 *    "value":0
 *  },
 *  "left": {
 *    "status": 400,
 *    "body": {
 *      "error": "Invalid price",
 *      "message": "Product price cannot be zero"
 *    }},
 *  "right": {
 *    "status": 201,
 *    "body": {
 *      "id": 999,
 *      "name": "Premium Product",
 *      "description": "High-quality premium product",
 *      "price": 99.99,
 *      "category": "premium",
 *      "inStock": true,
 *      "createdAt": "2024-01-01T00:00:00Z",
 *      "message": "Premium product created successfully"
 *  }}}
 */
interface CreateProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: string;
  message: string;
}

export default CreateProductResponse;
