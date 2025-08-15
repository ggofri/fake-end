import { setVerbose, verboseLog, verboseError, verboseWarn } from '../logger';

describe('Logger Utils', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset verbose state before each test
    setVerbose(false);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('setVerbose', () => {
    it('should set verbose mode to true', () => {
      setVerbose(true);
      
      verboseLog('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });

    it('should set verbose mode to false', () => {
      setVerbose(true); // First set to true
      verboseLog('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
      
      consoleLogSpy.mockClear();
      
      setVerbose(false); // Then set to false
      verboseLog('test message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple calls to setVerbose', () => {
      setVerbose(true);
      setVerbose(false);
      setVerbose(true);
      
      verboseLog('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });
  });

  describe('verboseLog', () => {
    it('should log message when verbose is enabled', () => {
      setVerbose(true);
      
      verboseLog('Hello, world!');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Hello, world!');
    });

    it('should not log message when verbose is disabled', () => {
      setVerbose(false);
      
      verboseLog('Hello, world!');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      setVerbose(true);
      
      verboseLog('Message:', 123, { key: 'value' }, [1, 2, 3]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Message:', 123, { key: 'value' }, [1, 2, 3]);
    });

    it('should handle no arguments', () => {
      setVerbose(true);
      
      verboseLog();
      
      expect(consoleLogSpy).toHaveBeenCalledWith();
    });

    it('should handle null and undefined arguments', () => {
      setVerbose(true);
      
      verboseLog(null, undefined);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(null, undefined);
    });

    it('should handle complex objects', () => {
      setVerbose(true);
      
      const complexObject = {
        nested: {
          array: [1, 2, { deep: true }],
          func: () => 'test'
        }
      };
      
      verboseLog('Complex object:', complexObject);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Complex object:', complexObject);
    });

    it('should handle boolean arguments', () => {
      setVerbose(true);
      
      verboseLog(true, false);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(true, false);
    });

    it('should handle string interpolation', () => {
      setVerbose(true);
      const name = 'Jest';
      
      verboseLog(`Testing with ${name}`);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Testing with Jest');
    });
  });

  describe('verboseError', () => {
    it('should log error when verbose is enabled', () => {
      setVerbose(true);
      
      verboseError('Error occurred!');
      
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred!');
    });

    it('should not log error when verbose is disabled', () => {
      setVerbose(false);
      
      verboseError('Error occurred!');
      
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      setVerbose(true);
      const error = new Error('Test error');
      
      verboseError('Critical error:', error, 500);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Critical error:', error, 500);
    });

    it('should handle Error objects', () => {
      setVerbose(true);
      const error = new Error('Test error message');
      
      verboseError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('should handle no arguments', () => {
      setVerbose(true);
      
      verboseError();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith();
    });

    it('should handle stack traces', () => {
      setVerbose(true);
      const error = new Error('Stack trace test');
      
      verboseError('Error with stack:', error.stack);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error with stack:', error.stack);
    });
  });

  describe('verboseWarn', () => {
    it('should log warning when verbose is enabled', () => {
      setVerbose(true);
      
      verboseWarn('Warning message!');
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message!');
    });

    it('should not log warning when verbose is disabled', () => {
      setVerbose(false);
      
      verboseWarn('Warning message!');
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      setVerbose(true);
      
      verboseWarn('Deprecated:', 'function xyz()', 'Use abc() instead');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Deprecated:', 'function xyz()', 'Use abc() instead');
    });

    it('should handle objects and arrays', () => {
      setVerbose(true);
      const warningData = { code: 'WARN001', message: 'Potential issue' };
      
      verboseWarn('Warning data:', warningData);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning data:', warningData);
    });

    it('should handle no arguments', () => {
      setVerbose(true);
      
      verboseWarn();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith();
    });
  });

  describe('Verbose state persistence', () => {
    it('should maintain verbose state across multiple function calls', () => {
      setVerbose(true);
      
      verboseLog('Log 1');
      verboseError('Error 1');
      verboseWarn('Warn 1');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Log 1');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error 1');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warn 1');
      
      verboseLog('Log 2');
      verboseError('Error 2');
      verboseWarn('Warn 2');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Log 2');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error 2');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warn 2');
    });

    it('should affect all logging functions when verbose state changes', () => {
      // Start with verbose disabled
      setVerbose(false);
      
      verboseLog('Should not log');
      verboseError('Should not error');
      verboseWarn('Should not warn');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      // Enable verbose
      setVerbose(true);
      
      verboseLog('Should log');
      verboseError('Should error');
      verboseWarn('Should warn');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Should log');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Should error');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Should warn');
    });
  });

  describe('Default behavior', () => {
    it('should start with verbose disabled by default', () => {
      // Without calling setVerbose, it should default to false
      verboseLog('Default test');
      verboseError('Default test');
      verboseWarn('Default test');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid verbose state changes', () => {
      setVerbose(true);
      verboseLog('Message 1');
      
      setVerbose(false);
      verboseLog('Message 2');
      
      setVerbose(true);
      verboseLog('Message 3');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Message 1');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'Message 3');
    });

    it('should handle concurrent logging calls', () => {
      setVerbose(true);
      
      Promise.all([
        Promise.resolve(verboseLog('Async log 1')),
        Promise.resolve(verboseError('Async error 1')),
        Promise.resolve(verboseWarn('Async warn 1'))
      ]);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Async log 1');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Async error 1');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Async warn 1');
    });

    it('should handle extremely long messages', () => {
      setVerbose(true);
      const longMessage = 'A'.repeat(10000);
      
      verboseLog(longMessage);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(longMessage);
    });

    it('should handle special characters and unicode', () => {
      setVerbose(true);
      
      verboseLog('Special chars: !@#$%^&*()_+-=[]{}|;\':",./<>?');
      verboseLog('Unicode: 🚀 💻 🎉 café naïve résumé');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Special chars: !@#$%^&*()_+-=[]{}|;\':",./<>?');
      expect(consoleLogSpy).toHaveBeenCalledWith('Unicode: 🚀 💻 🎉 café naïve résumé');
    });
  });
});