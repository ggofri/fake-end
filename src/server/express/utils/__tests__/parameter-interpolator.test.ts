import { interpolateParams } from '../parameter-interpolator';

describe('ParameterInterpolator', () => {
  describe('interpolateParams', () => {
    describe('string interpolation', () => {
      it('should interpolate path parameters with colon syntax', () => {
        const input = 'User :id has name :name';
        const params = { id: '123', name: 'John' };
        
        const result = interpolateParams(input, params, {}, {});
        
        expect(result).toBe('User 123 has name John');
      });

      it('should interpolate query parameters with template syntax', () => {
        const input = 'Filter: {{query.filter}} with limit {{query.limit}}';
        const query = { filter: 'active', limit: '10' };
        
        const result = interpolateParams(input, {}, query, {});
        
        expect(result).toBe('Filter: active with limit 10');
      });

      it('should interpolate body parameters with template syntax', () => {
        const input = 'Name: {{body.name}}, Age: {{body.age}}';
        const body = { name: 'John', age: 30 };
        
        const result = interpolateParams(input, {}, {}, body);
        
        expect(result).toBe('Name: John, Age: 30');
      });

      it('should handle nested body parameters', () => {
        const input = 'User: {{body.user.name}}, City: {{body.user.address.city}}';
        const body = { 
          user: { 
            name: 'John', 
            address: { city: 'NYC' } 
          } 
        };
        
        const result = interpolateParams(input, {}, {}, body);
        
        expect(result).toBe('User: John, City: NYC');
      });

      it('should handle null values gracefully', () => {
        const input = 'ID: :id, Name: :name';
        const params = { id: null, name: undefined };
        
        const result = interpolateParams(input, params, {}, {});
        
        expect(result).toBe('ID: , Name: :name');
      });

      it('should handle mixed interpolation types', () => {
        const input = 'User :id has name {{body.name}} with filter {{query.filter}}';
        const params = { id: '123' };
        const query = { filter: 'active' };
        const body = { name: 'John' };
        
        const result = interpolateParams(input, params, query, body);
        
        expect(result).toBe('User 123 has name John with filter active');
      });
    });

    describe('object interpolation', () => {
      it('should interpolate object properties', () => {
        const input = {
          id: ':id',
          name: '{{body.name}}',
          status: '{{query.status}}'
        };
        const params = { id: '123' };
        const query = { status: 'active' };
        const body = { name: 'John' };
        
        const result = interpolateParams(input, params, query, body);
        
        expect(result).toEqual({
          id: '123',
          name: 'John',
          status: 'active'
        });
      });

      it('should handle nested objects', () => {
        const input = {
          user: {
            id: ':id',
            profile: {
              name: '{{body.name}}'
            }
          }
        };
        const params = { id: '123' };
        const body = { name: 'John' };
        
        const result = interpolateParams(input, params, {}, body);
        
        expect(result).toEqual({
          user: {
            id: '123',
            profile: {
              name: 'John'
            }
          }
        });
      });
    });

    describe('array interpolation', () => {
      it('should interpolate array elements', () => {
        const input = [':id', '{{body.name}}', 'static'];
        const params = { id: '123' };
        const body = { name: 'John' };
        
        const result = interpolateParams(input, params, {}, body);
        
        expect(result).toEqual(['123', 'John', 'static']);
      });
    });

    describe('primitive values', () => {
      it('should return numbers unchanged', () => {
        expect(interpolateParams(42, {}, {}, {})).toBe(42);
      });

      it('should return booleans unchanged', () => {
        expect(interpolateParams(true, {}, {}, {})).toBe(true);
      });

      it('should return null unchanged', () => {
        expect(interpolateParams(null, {}, {}, {})).toBe(null);
      });
    });

    describe('circular references', () => {
      it('should handle circular references gracefully', () => {
        const circularObj: any = { name: 'test' };
        circularObj.self = circularObj;
        
        const input = { data: '{{body.name}}', ref: circularObj };
        
        const result = interpolateParams(input, {}, {}, { name: 'John' });
        
        expect(result).toEqual({ 
          data: 'John', 
          ref: { name: 'test', self: '[circular]' }
        });
      });
    });

    describe('special placeholders', () => {
      it('should handle {{body}} placeholder', () => {
        const input = '{{body}}';
        const body = { name: 'John', age: 30 };
        
        const result = interpolateParams(input, {}, {}, body);
        
        expect(result).toEqual(body);
      });

      it('should handle single property placeholders', () => {
        const input = '{{body.name}}';
        const body = { name: 'John' };
        
        const result = interpolateParams(input, {}, {}, body);
        
        expect(result).toBe('John');
      });
    });
  });
});
