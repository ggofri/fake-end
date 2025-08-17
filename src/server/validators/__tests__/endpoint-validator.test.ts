import { isValidEndpoint, isValidGuard, isValidGuardCondition, isValidGuardResponse } from '../endpoint-validator';

describe('endpoint-validator', () => {
  describe('isValidEndpoint', () => {
    it('should return true for valid endpoint', () => {
      const endpoint = {
        method: 'GET',
        path: '/test',
        status: 200,
        body: { message: 'test' }
      };

      expect(isValidEndpoint(endpoint)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const endpoint = {
        method: 'GET',
        path: '/test'
      };

      expect(isValidEndpoint(endpoint)).toBe(false);
    });

    it('should return false for invalid method', () => {
      const endpoint = {
        method: 'INVALID',
        path: '/test',
        status: 200
      };

      expect(isValidEndpoint(endpoint)).toBe(false);
    });

    it('should return true for endpoint with valid guard', () => {
      const endpoint = {
        method: 'POST',
        path: '/test',
        status: 200,
        guard: {
          condition: {
            field: 'email',
            operator: 'exists'
          },
          left: {
            status: 400,
            body: { error: 'Email required' }
          },
          right: {
            status: 200,
            body: { message: 'Success' }
          }
        }
      };

      expect(isValidEndpoint(endpoint)).toBe(true);
    });

    it('should return false for endpoint with invalid guard', () => {
      const endpoint = {
        method: 'POST',
        path: '/test',
        status: 200,
        guard: {
          condition: {
            field: 'email'
          }
        }
      };

      expect(isValidEndpoint(endpoint)).toBe(false);
    });
  });

  describe('isValidGuard', () => {
    it('should return true for valid guard', () => {
      const guard = {
        condition: {
          field: 'email',
          operator: 'exists'
        },
        left: {
          status: 400,
          body: { error: 'Required' }
        },
        right: {
          status: 200,
          body: { message: 'Success' }
        }
      };

      expect(isValidGuard(guard)).toBe(true);
    });

    it('should return false for missing condition', () => {
      const guard = {
        left: { status: 400 },
        right: { status: 200 }
      };

      expect(isValidGuard(guard)).toBe(false);
    });

    it('should return false for invalid condition', () => {
      const guard = {
        condition: {
          field: 'email'
        },
        left: { status: 400 },
        right: { status: 200 }
      };

      expect(isValidGuard(guard)).toBe(false);
    });
  });

  describe('isValidGuardCondition', () => {
    it('should return true for valid condition', () => {
      const condition = {
        field: 'email',
        operator: 'exists'
      };

      expect(isValidGuardCondition(condition)).toBe(true);
    });

    it('should return false for missing field', () => {
      const condition = {
        operator: 'exists'
      };

      expect(isValidGuardCondition(condition)).toBe(false);
    });

    it('should return false for invalid operator', () => {
      const condition = {
        field: 'email',
        operator: 'invalid_operator'
      };

      expect(isValidGuardCondition(condition)).toBe(false);
    });

    it('should return true for all valid operators', () => {
      const validOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'exists', 'not_exists'];
      
      validOperators.forEach(operator => {
        const condition = {
          field: 'test',
          operator
        };
        expect(isValidGuardCondition(condition)).toBe(true);
      });
    });
  });

  describe('isValidGuardResponse', () => {
    it('should return true for valid response', () => {
      const response = {
        status: 200,
        body: { message: 'Success' }
      };

      expect(isValidGuardResponse(response)).toBe(true);
    });

    it('should return false for missing status', () => {
      const response = {
        body: { message: 'Success' }
      };

      expect(isValidGuardResponse(response)).toBe(false);
    });

    it('should return false for non-number status', () => {
      const response = {
        status: 'invalid',
        body: { message: 'Success' }
      };

      expect(isValidGuardResponse(response)).toBe(false);
    });

    it('should return true for response without body', () => {
      const response = {
        status: 204
      };

      expect(isValidGuardResponse(response)).toBe(true);
    });
  });
});
