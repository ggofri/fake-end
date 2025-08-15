import express, { Application } from 'express';
import { setupMiddleware } from '../index';

jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  return {
    ...actualExpress,
    json: jest.fn(),
    urlencoded: jest.fn()
  };
});

const mockExpress = express as jest.Mocked<typeof express>;

describe('Middleware', () => {
  let mockApp: jest.Mocked<Application>;

  beforeEach(() => {
    mockApp = {
      use: jest.fn()
    } as any;

    jest.clearAllMocks();
  });

  describe('setupMiddleware', () => {
    it('should setup JSON middleware', () => {
      const jsonMiddleware = jest.fn();
      mockExpress.json.mockReturnValue(jsonMiddleware);

      setupMiddleware(mockApp);

      expect(mockExpress.json).toHaveBeenCalledTimes(1);
      expect(mockExpress.json).toHaveBeenCalledWith();
      expect(mockApp.use).toHaveBeenCalledWith(jsonMiddleware);
    });

    it('should setup URL encoded middleware with extended option', () => {
      const urlencodedMiddleware = jest.fn();
      mockExpress.urlencoded.mockReturnValue(urlencodedMiddleware);

      setupMiddleware(mockApp);

      expect(mockExpress.urlencoded).toHaveBeenCalledTimes(1);
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(mockApp.use).toHaveBeenCalledWith(urlencodedMiddleware);
    });

    it('should setup both middleware in correct order', () => {
      const jsonMiddleware = jest.fn();
      const urlencodedMiddleware = jest.fn();
      
      mockExpress.json.mockReturnValue(jsonMiddleware);
      mockExpress.urlencoded.mockReturnValue(urlencodedMiddleware);

      setupMiddleware(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(2);
      expect(mockApp.use).toHaveBeenNthCalledWith(1, jsonMiddleware);
      expect(mockApp.use).toHaveBeenNthCalledWith(2, urlencodedMiddleware);
    });

    it('should not throw with valid app instance', () => {
      expect(() => setupMiddleware(mockApp)).not.toThrow();
    });

    it('should handle multiple calls without duplication issues', () => {
      const jsonMiddleware = jest.fn();
      const urlencodedMiddleware = jest.fn();
      
      mockExpress.json.mockReturnValue(jsonMiddleware);
      mockExpress.urlencoded.mockReturnValue(urlencodedMiddleware);

      setupMiddleware(mockApp);
      setupMiddleware(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(4);
      expect(mockExpress.json).toHaveBeenCalledTimes(2);
      expect(mockExpress.urlencoded).toHaveBeenCalledTimes(2);
    });

    it('should create middleware with correct configuration', () => {
      setupMiddleware(mockApp);

      expect(mockExpress.json).toHaveBeenCalledWith();
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
    });

    it('should use express built-in middleware functions', () => {
      setupMiddleware(mockApp);

      expect(mockExpress.json).toHaveBeenCalled();
      expect(mockExpress.urlencoded).toHaveBeenCalled();
    });

    it('should not modify app instance beyond adding middleware', () => {
      const originalApp = { ...mockApp };
      
      setupMiddleware(mockApp);

      expect(Object.keys(mockApp)).toEqual(Object.keys(originalApp));
    });

    it('should handle app with existing middleware', () => {
      mockApp.use.mockImplementation(() => mockApp);

      setupMiddleware(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(2);
    });

    it('should return void', () => {
      const result = setupMiddleware(mockApp);
      
      expect(result).toBeUndefined();
    });


    it('should preserve middleware function references', () => {
      const jsonMiddleware = jest.fn();
      const urlencodedMiddleware = jest.fn();
      
      mockExpress.json.mockReturnValue(jsonMiddleware);
      mockExpress.urlencoded.mockReturnValue(urlencodedMiddleware);

      setupMiddleware(mockApp);

      const firstCall = (mockApp.use as jest.Mock).mock.calls[0][0];
      const secondCall = (mockApp.use as jest.Mock).mock.calls[1][0];

      expect(firstCall).toBe(jsonMiddleware);
      expect(secondCall).toBe(urlencodedMiddleware);
    });

    it('should handle different app configurations', () => {
      const apps = [
        { use: jest.fn() },
        { use: jest.fn(), get: jest.fn() },
        { use: jest.fn(), post: jest.fn(), put: jest.fn() }
      ];

      apps.forEach(app => {
        setupMiddleware(app as any);
        expect(app.use).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('middleware configuration', () => {
    it('should configure JSON middleware with default options', () => {
      setupMiddleware(mockApp);

      expect(mockExpress.json).toHaveBeenCalledWith();
    });

    it('should configure urlencoded middleware with extended true', () => {
      setupMiddleware(mockApp);

      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
    });

    it('should not pass additional options to middleware', () => {
      setupMiddleware(mockApp);

      expect(mockExpress.json).toHaveBeenCalledWith();
      expect(mockExpress.json).not.toHaveBeenCalledWith(expect.objectContaining({}));
    });
  });
});