import { generateFieldsFromResponse } from '../field-generator';

describe('field-generator', () => {
  describe('generateFieldsFromResponse', () => {
    it('should generate fields from primitive string', () => {
      const result = generateFieldsFromResponse('hello');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'data',
        type: 'string',
        mockValue: '"hello"'
      });
    });

    it('should generate fields from primitive number', () => {
      const result = generateFieldsFromResponse(42);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'data',
        type: 'number',
        mockValue: '42'
      });
    });

    it('should generate fields from primitive boolean', () => {
      const result = generateFieldsFromResponse(true);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'data',
        type: 'boolean',
        mockValue: 'true'
      });
    });

    it('should generate fields from null', () => {
      const result = generateFieldsFromResponse(null);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'data',
        type: 'unknown',
        mockValue: 'null'
      });
    });

    it('should generate fields from empty array', () => {
      const result = generateFieldsFromResponse([]);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'data',
        type: 'unknown[]',
        mockValue: '[]'
      });
    });

    it('should generate fields from array with objects', () => {
      const data = [{ id: 1, name: 'Test' }];
      const result = generateFieldsFromResponse(data);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('data');
      expect(result[0].type).toBe('Array<{id: number; name: string}>');
      expect(JSON.parse(result[0].mockValue)[0].id).toBe(1);
      expect(JSON.parse(result[0].mockValue)[0].name).toBe('Test');
    });

    it('should generate fields from simple object', () => {
      const actualUUID = crypto.randomUUID()
      const data = {
        id: actualUUID,
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };
      
      const result = generateFieldsFromResponse(data);
      expect(result).toHaveLength(4);
      
      const idField = result.find(f => f.name === 'id');
      expect(JSON.parse(idField.mockValue)).not.toEqual(actualUUID)
      expect(JSON.parse(idField.mockValue)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      
      const nameField = result.find(f => f.name === 'name');
      expect(nameField.mockValue).toMatch(/[A-Z][a-z]*\s[A-Z][a-z]*.*/)
      
      const emailField = result.find(f => f.name === 'email');
      expect(emailField.mockValue).toMatch(/^"[^@]+@[^.]+\.[^"]+"/);
      
      const activeField = result.find(f => f.name === 'active');
      expect(activeField).toEqual({
        name: 'active',
        type: 'boolean',
        mockValue: 'true'
      });
    });

    it('should generate fields from nested object', () => {
      const data = {
        user: {
          id: 1,
          profile: {
            name: 'Test'
          }
        },
        tags: ['tag1', 'tag2']
      };
      
      const result = generateFieldsFromResponse(data);
      
      expect(result).toHaveLength(2);
      
      const userField = result.find(f => f.name === 'user');
      expect(userField?.type).toBe('{ id: number; profile: { name: string } }');
      
      const tagsField = result.find(f => f.name === 'tags');
      expect(tagsField?.type).toBe('string[]');
    });
  });
});
