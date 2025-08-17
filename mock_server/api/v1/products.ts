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
  
  /** @mock () => new Date().toISOString() */
  updatedAt: string;

  /** @mock () => Math.floor(Math.random() * 1000) + 1 */
  viewCount: number;

  /** @mock () => Math.random() > 0.5 */
  isOnSale: boolean;

  /** @mock () => (Math.random() * 50 + 10).toFixed(2) */
  discountPercentage: string;

  /** @mock () => ['red', 'blue', 'green', 'black', 'white'][Math.floor(Math.random() * 5)] */
  availableColor: string;

  /** @mock () => Array.from({length: Math.floor(Math.random() * 5) + 1}, (_, i) => `tag${i + 1}`) */
  tags: string[];

  /** @mock () => ({ sku: `SKU-${Math.random().toString(36).substr(2, 9)}`, barcode: Math.floor(Math.random() * 1000000000000).toString() }) */
  metadata: Record<string, string>;

  /** @mock () => new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() */
  estimatedDelivery: string;

  /** @mock () => Math.floor(Math.random() * 50) */
  stockQuantity: number;

  /** @mock () => Math.random() < 0.1 ? null : `vendor_${Math.floor(Math.random() * 100)}` */
  vendorId: string | null;

  /** @mock () => `REV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` */
  revisionCode: string;

  /** @mock () => parseFloat((Math.random() * 5).toFixed(1)) */
  rating: number;

  /** @mock () => ({ length: Math.floor(Math.random() * 50), width: Math.floor(Math.random() * 50), height: Math.floor(Math.random() * 50), unit: 'cm' }) */
  dimensions: { length: number; width: number; height: number; unit: string };

  /** @mock () => Math.random() > 0.8 ? undefined : `promo_${Math.random().toString(36).substr(2, 6)}` */
  promoCode?: string;
}

export default Product;
