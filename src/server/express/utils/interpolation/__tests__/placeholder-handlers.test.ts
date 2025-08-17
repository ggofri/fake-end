import { handleSpecialPlaceholders, handleSinglePlaceholders } from '../placeholder-handlers';

describe('placeholder-handlers', () => {
  describe('handleSpecialPlaceholders', () => {
    it('should return body object for {{body}} placeholder', () => {
      const body = { name: 'John', age: 30 };
      const result = handleSpecialPlaceholders('{{body}}', body);
      expect(result).toEqual(body);
    });

    it('should return original string for non-special placeholders', () => {
      const body = { name: 'John' };
      expect(handleSpecialPlaceholders('{{body.name}}', body)).toBe('{{body.name}}');
      expect(handleSpecialPlaceholders('regular text', body)).toBe('regular text');
      expect(handleSpecialPlaceholders('{{query.param}}', body)).toBe('{{query.param}}');
    });
  });

  describe('handleSinglePlaceholders', () => {
    const params = { id: '123', userId: '456' };
    const query = { filter: 'active', limit: '10' };
    const body = { 
      user: { 
        name: 'John', 
        profile: { 
          email: 'john@example.com' 
        } 
      }, 
      count: 5 
    };

    it('should handle body placeholders', () => {
      expect(handleSinglePlaceholders('{{body.count}}', params, query, body)).toBe(5);
      expect(handleSinglePlaceholders('{{body.user.name}}', params, query, body)).toBe('John');
      expect(handleSinglePlaceholders('{{body.user.profile.email}}', params, query, body)).toBe('john@example.com');
    });

    it('should handle query placeholders', () => {
      expect(handleSinglePlaceholders('{{query.filter}}', params, query, body)).toBe('active');
      expect(handleSinglePlaceholders('{{query.limit}}', params, query, body)).toBe('10');
    });

    it('should handle path parameter placeholders', () => {
      expect(handleSinglePlaceholders(':id', params, query, body)).toBe('123');
      expect(handleSinglePlaceholders(':userId', params, query, body)).toBe('456');
    });

    it('should return original string for non-existent paths', () => {
      expect(handleSinglePlaceholders('{{body.nonexistent}}', params, query, body)).toBe('{{body.nonexistent}}');
      expect(handleSinglePlaceholders('{{query.nonexistent}}', params, query, body)).toBe('{{query.nonexistent}}');
      expect(handleSinglePlaceholders(':nonexistent', params, query, body)).toBe(':nonexistent');
    });

    it('should return original string for non-single placeholders', () => {
      expect(handleSinglePlaceholders('text with {{body.name}} embedded', params, query, body)).toBe('text with {{body.name}} embedded');
      expect(handleSinglePlaceholders('multiple :id and {{query.filter}}', params, query, body)).toBe('multiple :id and {{query.filter}}');
    });

    it('should handle malformed placeholders', () => {
      expect(handleSinglePlaceholders('{{body.}}', params, query, body)).toBe('{{body.}}');
      expect(handleSinglePlaceholders('{{.name}}', params, query, body)).toBe('{{.name}}');
      expect(handleSinglePlaceholders('{{body}}', params, query, body)).toBe('{{body}}');
    });
  });
});
