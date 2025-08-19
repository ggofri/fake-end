import { guardConditionGenerator } from '@/typescript-processing/dual-interface/guard-condition-generator';
import { CurlInfo } from '@/mock-generation/types';

describe('guard-condition-generator', () => {
  describe('generateConditions', () => {
    it('should generate conditions for empty required fields', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {},
        data: '{"name": "", "email": null}',
        path: '/users',
        queryParams: {}
      };

      const conditions = guardConditionGenerator.generateConditions(curlInfo);
      
      expect(conditions.length).toBeGreaterThan(0);
      expect(conditions[0].confidence).toBe('high');
      expect(conditions.some(c => c.condition.field === 'name')).toBe(true);
      expect(conditions.some(c => c.condition.field === 'email')).toBe(true);
    });

    it('should generate admin role condition for admin paths', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/admin/users',
        headers: {},
        data: '{}',
        path: '/admin/users',
        queryParams: {}
      };

      const conditions = guardConditionGenerator.generateConditions(curlInfo);
      
      expect(conditions.some(c => 
        c.condition.field === 'user.role' && 
        c.condition.value === 'admin'
      )).toBe(true);
      expect(conditions.find(c => c.condition.field === 'user.role')?.confidence).toBe('high');
    });

    it('should generate email validation for email fields', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {},
        data: '{"email": "test@example.com", "userEmail": "invalid"}',
        path: '/users',
        queryParams: {}
      };

      const conditions = guardConditionGenerator.generateConditions(curlInfo);
      
      expect(conditions.some(c => 
        c.condition.field === 'email' && 
        c.condition.operator === 'contains' &&
        c.condition.value === '@'
      )).toBe(true);
    });

    it('should handle query parameters', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/users?search=test&page=1',
        headers: {},
        path: '/users',
        queryParams: { search: 'test', page: '1' }
      };

      const conditions = guardConditionGenerator.generateConditions(curlInfo);
      
      expect(conditions.some(c => c.condition.field === 'query.search')).toBe(true);
      expect(conditions.some(c => c.condition.field === 'query.page')).toBe(true);
    });

    it('should provide fallback conditions for simple cases', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/simple',
        headers: {},
        data: '{}',
        path: '/simple',
        queryParams: {}
      };

      const conditions = guardConditionGenerator.generateConditions(curlInfo);
      
      expect(conditions.length).toBeGreaterThan(0);
      expect(conditions.some(c => c.condition.field === 'body')).toBe(true);
    });
  });

  describe('getBestCondition', () => {
    it('should return the highest confidence condition', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/admin/users',
        headers: {},
        data: '{"name": ""}',
        path: '/admin/users',
        queryParams: {}
      };

      const condition = guardConditionGenerator.getBestCondition(curlInfo);
      
      expect(condition).toBeDefined();
      expect(condition.field).toBeDefined();
      expect(condition.operator).toBeDefined();
    });

    it('should return fallback condition when no specific patterns match', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/simple',
        headers: {},
        path: '/simple',
        queryParams: {}
      };

      const condition = guardConditionGenerator.getBestCondition(curlInfo);
      
      expect(condition.field).toBe('body');
      expect(condition.operator).toBe('exists');
    });
  });
});
