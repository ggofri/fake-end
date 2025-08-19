import { generateMockValueForType } from '@/typescript-processing/dual-interface/mock-value-generator';

describe('mock-value-generator', () => {
  describe('generateMockValueForType', () => {
    it('should generate mock values based on field names', () => {
      
      const userIdResult = generateMockValueForType('user_id', 'dummy');
      expect(userIdResult).toMatch(/^"[a-f0-9-]{36}"$/); 
      
      const emailResult = generateMockValueForType('email', 'dummy');
      expect(emailResult).toMatch(/^"[^@]+@[^.]+\.[^"]+"/); 
      
      const userNameResult = generateMockValueForType('userName', 'dummy');
      expect(userNameResult).toMatch(/^"[A-Za-z0-9_.]+"/); 
      
      const phoneResult = generateMockValueForType('phoneNumber', 'dummy');
      expect(JSON.parse(phoneResult)).toMatch(/^[\d\s\-().x]+$/); 
      
      expect(generateMockValueForType('createdDate', null)).toBe('null');
      expect(generateMockValueForType('price', null)).toBe('null');
      expect(generateMockValueForType('totalCount', null)).toBe('null');
      expect(generateMockValueForType('isActive', null)).toBe('null');
      expect(generateMockValueForType('enabled', null)).toBe('null');
    });

    it('should use actual value when provided', () => {
      expect(generateMockValueForType('title', 'Test Title')).toBe('"Test Title"');
      expect(generateMockValueForType('count', 42)).toBe('42');
      expect(generateMockValueForType('active', true)).toBe('true');
    });

    it('should generate default values based on type when no field name match', () => {
      expect(generateMockValueForType('unknownField', null)).toBe('null');
      expect(generateMockValueForType('unknownField', undefined)).toBe(undefined);
    });

    it('should handle complex objects', () => {
      const complexObject = { nested: { value: 'test' } };
      const result = generateMockValueForType('data', complexObject);
      expect(result).toBe('{"nested":{"value":"test"}}');
    });

    it('should handle arrays', () => {
      const array = [1, 2, 3];
      const result = generateMockValueForType('items', array);
      expect(result).toBe('[1,2,3]');
    });

    it('should use sanitize mode by default - keep non-sensitive values, replace sensitive ones', () => {
      
      expect(generateMockValueForType('title', 'actual-title')).toBe('"actual-title"');
      expect(generateMockValueForType('status', 'active')).toBe('"active"');
      
      const emailResult = generateMockValueForType('email', 'actual@email.com');
      expect(emailResult).not.toBe('"actual@email.com"');
      expect(emailResult).toMatch(/^"[^@]+@[^.]+\.[^"]+"/); 
      
      const userIdResult = generateMockValueForType('user_id', 'actual-user-123');
      expect(userIdResult).not.toBe('"actual-user-123"');
      expect(userIdResult).toMatch(/^"[a-f0-9-]{36}"$/); 
    });

    it('should handle case insensitive field names', () => {
      const idResult = generateMockValueForType('USER_ID', 'dummy');
      expect(idResult).toMatch(/^"[a-f0-9-]{36}"$/); 
      
      const emailResult = generateMockValueForType('EMAIL', 'dummy');
      expect(emailResult).toMatch(/^"[^@]+@[^.]+\.[^"]+"/); 
      
      const nameResult = generateMockValueForType('NAME', 'dummy');
      expect(nameResult).toMatch(/^"[A-Za-z0-9_.\s'-]+"/); 
    });

    it('should use real strategy - always prefer actual values', () => {
      expect(generateMockValueForType('email', 'actual@email.com', 'real')).toBe('"actual@email.com"');
      expect(generateMockValueForType('password', 'actual-password', 'real')).toBe('"actual-password"');
      expect(generateMockValueForType('title', 'actual-title', 'real')).toBe('"actual-title"');
    });

    it('should use faker strategy - always prefer faker values', () => {
      expect(generateMockValueForType('title', 'actual-title', 'faker')).toBe('"sample value"');
      
      const emailResult = generateMockValueForType('email', 'actual@email.com', 'faker');
      expect(emailResult).toMatch(/^"[^@]+@[^.]+\.[^"]+"/); 
      
      const userIdResult = generateMockValueForType('user_id', 'actual-id', 'faker');
      expect(userIdResult).toMatch(/^"[a-f0-9-]{36}"$/); 
    });

    it('should use sanitize strategy - selective based on sensitivity', () => {
      
      expect(generateMockValueForType('title', 'actual-title', 'sanitize')).toBe('"actual-title"');
      expect(generateMockValueForType('status', 'active', 'sanitize')).toBe('"active"');
      expect(generateMockValueForType('created_at', '2024-01-01', 'sanitize')).toBe('"2024-01-01"');
      
      const emailResult = generateMockValueForType('email', 'actual@email.com', 'sanitize');
      expect(emailResult).toMatch(/^"[^@]+@[^.]+\.[^"]+"/); 
      
      const passwordResult = generateMockValueForType('password', 'actual-password', 'sanitize');
      expect(passwordResult).toMatch(/^"[A-Za-z0-9_]+"/); 
      
      const userIdResult = generateMockValueForType('user_id', 'actual-id', 'sanitize');
      expect(userIdResult).toMatch(/^"[a-f0-9-]{36}"$/); 
    });

    it('should respect actual type when generating faker values for sensitive fields', () => {
      const phoneNumberResult = generateMockValueForType('phone', 1234567890, 'sanitize');
      expect(phoneNumberResult).toMatch(/^\d{10}$/);
      
      const phoneStringResult = generateMockValueForType('phone', '123-456-7890', 'sanitize');
      expect(phoneStringResult).toMatch(/^"[\d\s\-().x]+"$/);
      
      const idNumberResult = generateMockValueForType('id', 12345, 'sanitize');
      expect(idNumberResult).toMatch(/^\d{5,6}$/);
    });
  });
});
