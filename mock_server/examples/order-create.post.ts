/**
 * Example combining guard functions with custom mock annotations
 * Shows how to create realistic API responses with conditional logic
 * 
 * @guard {
 *   "condition": {
 *     "field": "amount",
 *     "operator": "not_equals",
 *     "value": 0
 *   },
 *   "left": {
 *     "status": 400,
 *     "body": {
 *       "error": "INVALID_AMOUNT",
 *       "message": "Order amount must be greater than zero",
 *       "code": "ERR_001"
 *     }
 *   },
 *   "right": {
 *     "status": 201,
 *     "body": {
 *       "id": "order_789xyz",
 *       "status": "confirmed",
 *       "amount": 129.99,
 *       "currency": "USD",
 *       "customerId": "cust_456",
 *       "items": [
 *         {
 *           "productId": "prod_123",
 *           "name": "Premium Package",
 *           "quantity": 1,
 *           "unitPrice": 129.99
 *         }
 *       ],
 *       "shipping": {
 *         "method": "express",
 *         "cost": 9.99,
 *         "estimatedDays": 2
 *       },
 *       "paymentMethod": "credit_card",
 *       "orderDate": "2024-01-16T15:30:00Z",
 *       "message": "Order created successfully"
 *     }
 *   }
 * }
 */
interface CreateOrderResponse {
  /** @mock "order_abc123" */
  id: string;
  
  /** @mock "pending" */
  status: string;
  
  /** @mock "99.99" */
  amount: number;
  
  /** @mock "USD" */
  currency: string;
  
  /** @mock "customer_xyz789" */
  customerId: string;
  
  /** Array of order items */
  items: Array<{
    /** @mock "product_def456" */
    productId: string;
    
    /** @mock "Wireless Bluetooth Speaker" */
    name: string;
    
    /** @mock "2" */
    quantity: number;
    
    /** @mock "49.99" */
    unitPrice: number;
  }>;
  
  /** Shipping information */
  shipping: {
    /** @mock "standard" */
    method: string;
    
    /** @mock "5.99" */
    cost: number;
    
    /** @mock "5" */
    estimatedDays: number;
  };
  
  /** @mock "credit_card" */
  paymentMethod: string;
  
  /** @mock "2024-01-16T12:00:00Z" */
  orderDate: string;
  
  /** @mock "Order created successfully" */
  message: string;
  
  /** Optional tracking information */
  tracking?: {
    /** @mock "null" */
    trackingNumber: string | null;
    
    /** @mock "null" */
    carrier: string | null;
  };
  
  /** Customer notes (optional) */
  /** @mock "Please handle with care" */
  notes?: string;
  
  /** @mock "false" */
  isGift: boolean;
  
  /** Tax information */
  tax: {
    /** @mock "8.25" */
    rate: number;
    
    /** @mock "8.24" */
    amount: number;
  };
  
  /** Discounts applied */
  discounts: Array<{
    /** @mock "WELCOME10" */
    code: string;
    
    /** @mock "percentage" */
    type: string;
    
    /** @mock "10.00" */
    value: number;
  }>;
}

export default CreateOrderResponse;