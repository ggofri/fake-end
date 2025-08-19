import { 
  evaluateArrowFunction, 
  isArrowFunction, 
  isBodyAwareFunction, 
  evaluateDynamicMocks 
} from '../../utils/mock-value-evaluator';

describe('mock-value-evaluator', () => {
  describe('isArrowFunction', () => {
    it('should detect regular arrow functions', () => {
      expect(isArrowFunction('() => "test"')).toBe(true);
      expect(isArrowFunction('() => Math.random()')).toBe(true);
    });

    it('should detect body-aware arrow functions', () => {
      expect(isArrowFunction('(body) => body.username')).toBe(true);
      expect(isArrowFunction('(body) => body?.email || "default"')).toBe(true);
    });

    it('should reject non-arrow function strings', () => {
      expect(isArrowFunction('test')).toBe(false);
      expect(isArrowFunction('function() { return "test"; }')).toBe(false);
      expect(isArrowFunction('body => body.username')).toBe(false);
    });
  });

  describe('isBodyAwareFunction', () => {
    it('should detect body-aware functions', () => {
      expect(isBodyAwareFunction('(body) => body.username')).toBe(true);
      expect(isBodyAwareFunction('(body) => body?.email || "default"')).toBe(true);
    });

    it('should reject regular functions', () => {
      expect(isBodyAwareFunction('() => "test"')).toBe(false);
      expect(isBodyAwareFunction('() => Math.random()')).toBe(false);
      expect(isBodyAwareFunction('test')).toBe(false);
    });
  });

  describe('evaluateArrowFunction', () => {
    it('should evaluate regular arrow functions', () => {
      expect(evaluateArrowFunction('() => "hello"')).toBe('hello');
      expect(evaluateArrowFunction('() => 42')).toBe(42);
      expect(evaluateArrowFunction('() => true')).toBe(true);
    });

    it('should evaluate body-aware functions with body parameter', () => {
      const body = { username: 'johndoe', email: 'john@example.com' };
      
      expect(evaluateArrowFunction('(body) => body.username', body)).toBe('johndoe');
      expect(evaluateArrowFunction('(body) => body.email', body)).toBe('john@example.com');
      expect(evaluateArrowFunction('(body) => body?.role || "user"', body)).toBe('user');
    });

    it('should handle body-aware functions without body parameter', () => {
      expect(evaluateArrowFunction('(body) => body?.username || "anonymous"')).toBe('anonymous');
      expect(evaluateArrowFunction('(body) => body?.email || "default@example.com"')).toBe('default@example.com');
    });

    it('should return null for invalid expressions', () => {
      expect(evaluateArrowFunction('invalid expression')).toBe(null);
      expect(evaluateArrowFunction('() => unknownVariable')).toBe(null);
    });
  });

  describe('evaluateDynamicMocks', () => {
    it('should evaluate dynamic mocks without body', () => {
      const data = {
        id: { _dynamicFunction: '() => 123' },
        name: 'static value'
      };

      const result = evaluateDynamicMocks(data);
      expect(result).toEqual({
        id: 123,
        name: 'static value'
      });
    });

    it('should evaluate dynamic mocks with body', () => {
      const data = {
        username: { _dynamicFunction: '(body) => body.username' },
        email: { _dynamicFunction: '(body) => body?.email || "default@example.com"' },
        static: 'value'
      };
      
      const body = { username: 'johndoe', email: 'john@example.com' };
      const result = evaluateDynamicMocks(data, body);
      
      expect(result).toEqual({
        username: 'johndoe',
        email: 'john@example.com',
        static: 'value'
      });
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          id: { _dynamicFunction: '(body) => body.userId' },
          profile: {
            name: { _dynamicFunction: '(body) => body.name' }
          }
        }
      };
      
      const body = { userId: 123, name: 'John Doe' };
      const result = evaluateDynamicMocks(data, body);
      
      expect(result).toEqual({
        user: {
          id: 123,
          profile: {
            name: 'John Doe'
          }
        }
      });
    });

    it('should handle arrays', () => {
      const data = [
        { _dynamicFunction: '(body) => body.first' },
        { _dynamicFunction: '() => "static"' },
        'plain value'
      ];
      
      const body = { first: 'hello' };
      const result = evaluateDynamicMocks(data, body);
      
      expect(result).toEqual(['hello', 'static', 'plain value']);
    });
  });
});
