import { 
  createResourceResponse, 
  createSuccessResponse, 
  createCreatedResponse, 
  createUpdatedResponse 
} from '../response-templates';

describe('Response Templates Utils', () => {
  const mockDate = new Date('2023-01-01T12:00:00.000Z');
  const originalDate = Date;

  beforeAll(() => {
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    global.Date.prototype.toISOString = jest.fn(() => mockDate.toISOString());
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe('createResourceResponse', () => {
    it('should create basic resource response with id', () => {
      const result = createResourceResponse('123');
      
      expect(result).toEqual({
        id: '123',
        name: 'Resource 123',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle numeric id as string', () => {
      const result = createResourceResponse('456');
      
      expect(result).toEqual({
        id: '456',
        name: 'Resource 456',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle empty string id', () => {
      const result = createResourceResponse('');
      
      expect(result).toEqual({
        id: '',
        name: 'Resource ',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle special characters in id', () => {
      const result = createResourceResponse('user-123_test');
      
      expect(result).toEqual({
        id: 'user-123_test',
        name: 'Resource user-123_test',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle long id values', () => {
      const longId = 'a'.repeat(100);
      const result = createResourceResponse(longId);
      
      expect(result).toEqual({
        id: longId,
        name: `Resource ${longId}`,
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle unicode characters in id', () => {
      const result = createResourceResponse('user-🚀-123');
      
      expect(result).toEqual({
        id: 'user-🚀-123',
        name: 'Resource user-🚀-123',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should create new Date instances for timestamps', () => {
      const result1 = createResourceResponse('1');
      const result2 = createResourceResponse('2');
      
      expect(result1.createdAt).toBe(result2.createdAt);
      expect(result1.updatedAt).toBe(result2.updatedAt);
    });

    it('should return object with correct property types', () => {
      const result = createResourceResponse('test');
      
      expect(typeof result.id).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with message', () => {
      const result = createSuccessResponse('Operation completed successfully');
      
      expect(result).toEqual({
        message: 'Operation completed successfully',
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle empty message', () => {
      const result = createSuccessResponse('');
      
      expect(result).toEqual({
        message: '',
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long success message that contains a lot of text and details about the operation that was completed successfully.';
      const result = createSuccessResponse(longMessage);
      
      expect(result).toEqual({
        message: longMessage,
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle special characters in message', () => {
      const result = createSuccessResponse('Success! ✅ Operation completed with 100% accuracy.');
      
      expect(result).toEqual({
        message: 'Success! ✅ Operation completed with 100% accuracy.',
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const result = createSuccessResponse(multilineMessage);
      
      expect(result).toEqual({
        message: multilineMessage,
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle messages with quotes', () => {
      const result = createSuccessResponse('User "John Doe" was created successfully');
      
      expect(result).toEqual({
        message: 'User "John Doe" was created successfully',
        timestamp: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should return object with correct property types', () => {
      const result = createSuccessResponse('test');
      
      expect(typeof result.message).toBe('string');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('createCreatedResponse', () => {
    it('should create created response with id and data', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = createCreatedResponse('user-123', data);
      
      expect(result).toEqual({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        message: 'Resource created successfully',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle empty data object', () => {
      const result = createCreatedResponse('123', {});
      
      expect(result).toEqual({
        id: '123',
        message: 'Resource created successfully',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should merge data properties correctly', () => {
      const data = {
        title: 'Test Post',
        content: 'This is test content',
        tags: ['test', 'example'],
        metadata: { author: 'John', priority: 'high' }
      };
      const result = createCreatedResponse('post-456', data);
      
      expect(result).toEqual({
        id: 'post-456',
        title: 'Test Post',
        content: 'This is test content',
        tags: ['test', 'example'],
        metadata: { author: 'John', priority: 'high' },
        message: 'Resource created successfully',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should override data properties with response properties when conflicting', () => {
      const data = {
        id: 'original-id',
        message: 'Original message',
        createdAt: 'original-date',
        name: 'John'
      };
      const result = createCreatedResponse('new-id', data);
      
      expect(result).toEqual({
        id: 'new-id',
        message: 'Resource created successfully',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z',
        name: 'John'
      });
    });

    it('should handle complex nested data', () => {
      const data = {
        user: {
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        permissions: ['read', 'write']
      };
      const result = createCreatedResponse('complex-123', data);
      
      expect(result.user).toEqual(data.user);
      expect(result.permissions).toEqual(data.permissions);
      expect(result.id).toBe('complex-123');
      expect(result.message).toBe('Resource created successfully');
    });

    it('should handle data with null and undefined values', () => {
      const data = {
        nullable: null,
        undefinedValue: undefined,
        name: 'Test'
      };
      const result = createCreatedResponse('test-123', data);
      
      expect(result).toEqual({
        id: 'test-123',
        nullable: null,
        undefinedValue: undefined,
        name: 'Test',
        message: 'Resource created successfully',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should return object with correct property types', () => {
      const result = createCreatedResponse('test', { name: 'Test' });
      
      expect(typeof result.id).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });
  });

  describe('createUpdatedResponse', () => {
    it('should create updated response with id and data', () => {
      const data = { name: 'Jane', email: 'jane@example.com' };
      const result = createUpdatedResponse('user-456', data);
      
      expect(result).toEqual({
        id: 'user-456',
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Resource updated successfully',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should handle empty data object', () => {
      const result = createUpdatedResponse('123', {});
      
      expect(result).toEqual({
        id: '123',
        message: 'Resource updated successfully',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should merge data properties correctly', () => {
      const data = {
        title: 'Updated Post',
        content: 'Updated content',
        status: 'published',
        views: 100
      };
      const result = createUpdatedResponse('post-789', data);
      
      expect(result).toEqual({
        id: 'post-789',
        title: 'Updated Post',
        content: 'Updated content',
        status: 'published',
        views: 100,
        message: 'Resource updated successfully',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('should override data properties with response properties when conflicting', () => {
      const data = {
        id: 'original-id',
        message: 'Original message',
        updatedAt: 'original-date',
        name: 'Jane'
      };
      const result = createUpdatedResponse('new-id', data);
      
      expect(result).toEqual({
        id: 'new-id',
        message: 'Resource updated successfully',
        updatedAt: '2023-01-01T12:00:00.000Z',
        name: 'Jane'
      });
    });

    it('should not include createdAt timestamp', () => {
      const data = { name: 'Test' };
      const result = createUpdatedResponse('test-123', data);
      
      expect(result).not.toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle complex nested data', () => {
      const data = {
        settings: {
          notifications: {
            email: true,
            push: false
          },
          privacy: {
            public: false
          }
        },
        lastLogin: '2023-01-01T10:00:00.000Z'
      };
      const result = createUpdatedResponse('user-complex', data);
      
      expect(result.settings).toEqual(data.settings);
      expect(result.lastLogin).toBe(data.lastLogin);
      expect(result.id).toBe('user-complex');
      expect(result.message).toBe('Resource updated successfully');
    });

    it('should handle data with functions (should be preserved)', () => {
      const data = {
        name: 'Test',
        calculate: () => 'result'
      };
      const result = createUpdatedResponse('test-123', data);
      
      expect(result.name).toBe('Test');
      expect(typeof result.calculate).toBe('function');
      expect(typeof result.calculate === 'function' && result.calculate()).toBe('result');
    });

    it('should return object with correct property types', () => {
      const result = createUpdatedResponse('test', { name: 'Test' });
      
      expect(typeof result.id).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });
  });

  describe('Response template differences', () => {
    it('should have different messages for created vs updated', () => {
      const createdResponse = createCreatedResponse('123', {});
      const updatedResponse = createUpdatedResponse('123', {});
      
      expect(createdResponse.message).toBe('Resource created successfully');
      expect(updatedResponse.message).toBe('Resource updated successfully');
    });

    it('should include createdAt only in created response', () => {
      const createdResponse = createCreatedResponse('123', {});
      const updatedResponse = createUpdatedResponse('123', {});
      
      expect(createdResponse).toHaveProperty('createdAt');
      expect(updatedResponse).not.toHaveProperty('createdAt');
      
      expect(createdResponse).toHaveProperty('updatedAt');
      expect(updatedResponse).toHaveProperty('updatedAt');
    });

    it('should handle same data differently for created vs updated', () => {
      const data = { name: 'Test', value: 42 };
      const createdResponse = createCreatedResponse('123', data);
      const updatedResponse = createUpdatedResponse('123', data);
      
      expect(createdResponse.name).toBe(updatedResponse.name);
      expect(createdResponse.value).toBe(updatedResponse.value);
      expect(createdResponse.id).toBe(updatedResponse.id);
      
      expect(createdResponse.message).not.toBe(updatedResponse.message);
      expect(createdResponse).toHaveProperty('createdAt');
      expect(updatedResponse).not.toHaveProperty('createdAt');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extremely large data objects', () => {
      const largeData: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`field${i}`] = `value${i}`;
      }
      
      const result = createCreatedResponse('large-123', largeData);
      
      expect(Object.keys(result)).toHaveLength(1004);
      expect(result.id).toBe('large-123');
      expect(result.message).toBe('Resource created successfully');
    });

    it('should handle circular references in data (spread operator limitation)', () => {
      const data: any = { name: 'Test' };
      data.self = data;
      
      expect(() => createCreatedResponse('circular-123', data)).not.toThrow();
    });

    it('should preserve symbol properties if present', () => {
      const symbol: symbol = Symbol('test');
      const data = {
        name: 'Test',
        [symbol]: 'symbol value'
      };
      
      const result = createCreatedResponse('symbol-123', data);
      
      expect(result.name).toBe('Test');
      expect(result[symbol as any]).toBe('symbol value');
    });
  });
});
