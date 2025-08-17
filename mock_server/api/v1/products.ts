interface Product {
  /** @mock "12345" */
  id: number;
  
  /** @mock "Premium Wireless Headphones" */
  name: string;
  
  /** @mock "High-quality noise-cancelling wireless headphones with premium sound quality" */
  description: string;
  
  /** @mock "299.99" */
  price: number;
  
  /** @mock "Electronics" */
  category: string;
  
  /** @mock "true" */
  inStock: boolean;
  
  /** @mock "2024-01-15T10:30:00Z" */
  createdAt: string;
  
  /** @mock "2024-01-16T14:20:00Z" */
  updatedAt: string;
}

export default Product;
