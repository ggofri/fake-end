/**
 * Example showing various @mock JSDoc annotations for custom mock data
 * This demonstrates how to override default mock generation with specific values
 */
interface UserProfile {
  /** @mock "user-123-abc" */
  id: string;
  
  /** @mock "john.doe@example.com" */
  email: string;
  
  /** @mock "John Doe" */
  name: string;
  
  /** @mock "28" */
  age: number;
  
  /** @mock "admin" */
  role: string;
  
  /** @mock "true" */
  isActive: boolean;
  
  /** @mock "false" */
  isVerified: boolean;
  
  /** Custom address object with nested mock values */
  address: {
    /** @mock "123 Main Street" */
    street: string;
    
    /** @mock "San Francisco" */
    city: string;
    
    /** @mock "CA" */
    state: string;
    
    /** @mock "94102" */
    zipCode: string;
  };
  
  /** @mock "['reading', 'coding', 'hiking']" */
  hobbies: string[];
  
  /** @mock "{'theme': 'dark', 'notifications': true, 'language': 'en'}" */
  preferences: Record<string, unknown>;
  
  /** @mock "2024-01-15T08:30:00Z" */
  lastLoginAt: string;
  
  /** @mock "2023-12-01T12:00:00Z" */
  createdAt: string;
  
  /** Optional field that can be null */
  /** @mock "null" */
  deletedAt: string | null;
  
  /** Numeric fields with specific values */
  /** @mock "1500.50" */
  accountBalance: number;
  
  /** @mock "42" */
  totalOrders: number;
  
  /** String with special characters */
  /** @mock "Welcome! This is a test message with \"quotes\" and symbols: @#$%" */
  welcomeMessage: string;
  
  /** URL example */
  /** @mock "https://example.com/avatar/user-123.jpg" */
  avatarUrl: string;
  
  /** Phone number example */
  /** @mock "+1-555-123-4567" */
  phoneNumber: string;
}

export default UserProfile;