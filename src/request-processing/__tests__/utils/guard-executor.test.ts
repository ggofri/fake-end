import { executeGuard } from '../../guard-processor/guard-executor';
import { GuardFunction, isLeft, isRight } from '@/shared/types';

describe('guard-executor', () => {
  const mockGuard: GuardFunction = {
    condition: {
      field: 'email',
      operator: 'equals',
      value: 'admin@test.com'
    },
    left: {
      status: 403,
      body: { error: 'Access denied' }
    },
    right: {
      status: 200,
      body: { message: 'Access granted' }
    }
  };

  const mockDir = '/test/mock';

  describe('executeGuard', () => {
    it('should return right when condition is true', async () => {
      const requestBody = { email: 'admin@test.com' };
      const result = await executeGuard(mockGuard, requestBody, {}, mockDir);
      
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.value.status).toBe(200);
        expect(result.value.body).toEqual({ message: 'Access granted' });
      }
    });

    it('should return left when condition is false', async () => {
      const requestBody = { email: 'user@test.com' };
      const result = await executeGuard(mockGuard, requestBody, {}, mockDir);
      
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.value.status).toBe(403);
        expect(result.value.body).toEqual({ error: 'Access denied' });
      }
    });

    it('should handle not_equals operator', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'status',
          operator: 'not_equals',
          value: 'active'
        },
        left: { status: 400, body: { error: 'Invalid status' } },
        right: { status: 200, body: { message: 'Valid status' } }
      };

      const result = await executeGuard(guard, { status: 'inactive' }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should handle contains operator for strings', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'message',
          operator: 'contains',
          value: 'error'
        },
        left: { status: 400, body: { error: 'Contains error' } },
        right: { status: 200, body: { message: 'No error' } }
      };

      const result = await executeGuard(guard, { message: 'This is an error message' }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should handle contains operator for arrays', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'tags',
          operator: 'contains',
          value: 'admin'
        },
        left: { status: 403, body: { error: 'Admin access' } },
        right: { status: 200, body: { message: 'Regular access' } }
      };

      const result = await executeGuard(guard, { tags: ['user', 'admin', 'editor'] }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should handle exists operator', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'userId',
          operator: 'exists'
        },
        left: { status: 400, body: { error: 'No user' } },
        right: { status: 200, body: { message: 'User exists' } }
      };

      const result = await executeGuard(guard, { userId: '123' }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should handle not_exists operator', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'deletedAt',
          operator: 'not_exists'
        },
        left: { status: 410, body: { error: 'Deleted' } },
        right: { status: 200, body: { message: 'Not deleted' } }
      };

      const result = await executeGuard(guard, { id: '123' }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should handle nested field paths', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'user.role',
          operator: 'equals',
          value: 'admin'
        },
        left: { status: 403, body: { error: 'Not admin' } },
        right: { status: 200, body: { message: 'Admin access' } }
      };

      const result = await executeGuard(guard, { user: { role: 'admin', id: '123' } }, {}, mockDir);
      expect(isRight(result)).toBe(true);
    });

    it('should return left when nested field does not exist', async () => {
      const guard: GuardFunction = {
        condition: {
          field: 'user.role',
          operator: 'equals',
          value: 'admin'
        },
        left: { status: 403, body: { error: 'Not admin' } },
        right: { status: 200, body: { message: 'Admin access' } }
      };

      const result = await executeGuard(guard, { userId: '123' }, {}, mockDir);
      expect(isLeft(result)).toBe(true);
    });
  });
});
