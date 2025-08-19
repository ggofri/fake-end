import * as loggerModule from '../../utils/logger';
import * as validationModule from '../../utils/validation';
import * as urlParserModule from '../../utils/url-parser';
import * as responseTemplatesModule from '../../utils/response-templates';
import * as portUtilsModule from '../../utils/port-utils';
import * as typeguardsModule from '../../utils/typeguards';

describe('Utils Index', () => {
  describe('Module Exports', () => {
    it('should export all logger functions', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.setVerbose).toBe(loggerModule.setVerbose);
      expect(utilsIndex.verboseLog).toBe(loggerModule.verboseLog);
      expect(utilsIndex.verboseError).toBe(loggerModule.verboseError);
      expect(utilsIndex.verboseWarn).toBe(loggerModule.verboseWarn);
    });

    it('should export all validation functions', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.isObject).toBe(validationModule.isObject);
      expect(utilsIndex.hasRequiredProperties).toBe(validationModule.hasRequiredProperties);
      expect(utilsIndex.hasValidPropertyTypes).toBe(validationModule.hasValidPropertyTypes);
      expect(utilsIndex.isValidHttpMethod).toBe(validationModule.isValidHttpMethod);
    });

    it('should export all url-parser functions', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.normalizeUrl).toBe(urlParserModule.normalizeUrl);
      expect(utilsIndex.extractQueryParams).toBe(urlParserModule.extractQueryParams);
      expect(utilsIndex.findFirstNonEmptyMatch).toBe(urlParserModule.findFirstNonEmptyMatch);
    });

    it('should export all response-templates functions', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.createResourceResponse).toBe(responseTemplatesModule.createResourceResponse);
      expect(utilsIndex.createSuccessResponse).toBe(responseTemplatesModule.createSuccessResponse);
      expect(utilsIndex.createCreatedResponse).toBe(responseTemplatesModule.createCreatedResponse);
      expect(utilsIndex.createUpdatedResponse).toBe(responseTemplatesModule.createUpdatedResponse);
    });

    it('should export all port-utils functions and interfaces', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.isPortAvailable).toBe(portUtilsModule.isPortAvailable);
      expect(utilsIndex.findAvailablePort).toBe(portUtilsModule.findAvailablePort);
      expect(utilsIndex.startServerWithPortFallback).toBe(portUtilsModule.startServerWithPortFallback);
    });

    it('should export all typeguards functions and types', () => {
      const utilsIndex = require('../../utils/index');
      
      expect(utilsIndex.isRecordOfUnknown).toBe(typeguardsModule.isRecordOfUnknown);
      expect(utilsIndex.isRecordOfStrings).toBe(typeguardsModule.isRecordOfStrings);
      expect(utilsIndex.isNil).toBe(typeguardsModule.isNil);
    });
  });

  describe('Module Structure', () => {
    it('should re-export all modules without namespace pollution', () => {
      const utilsIndex = require('../../utils/index');
      const exportedKeys = Object.keys(utilsIndex);
      
      const expectedExports = [
        'setVerbose', 'verboseLog', 'verboseError', 'verboseWarn',
        'isObject', 'hasRequiredProperties', 'hasValidPropertyTypes', 'isValidHttpMethod',
        'normalizeUrl', 'extractQueryParams', 'findFirstNonEmptyMatch',
        'createResourceResponse', 'createSuccessResponse', 'createCreatedResponse', 'createUpdatedResponse',
        'isPortAvailable', 'findAvailablePort', 'startServerWithPortFallback',
        'isRecordOfUnknown', 'isRecordOfStrings', 'isNil'
      ];
      
      expectedExports.forEach(exportName => {
        expect(exportedKeys).toContain(exportName);
      });
    });

    it('should not export any unexpected symbols', () => {
      const utilsIndex = require('../../utils/index');
      const exportedKeys = Object.keys(utilsIndex);
      
      const expectedExports = [
        'setVerbose', 'verboseLog', 'verboseError', 'verboseWarn',
        'withContext', 'debug', 'info', 'log', 'warn', 'error', 'verboseDebug', 'verboseInfo',
        'isObject', 'hasRequiredProperties', 'hasValidPropertyTypes', 'isValidHttpMethod',
        'normalizeUrl', 'extractQueryParams', 'findFirstNonEmptyMatch',
        'createResourceResponse', 'createSuccessResponse', 'createCreatedResponse', 'createUpdatedResponse',
        'isPortAvailable', 'findAvailablePort', 'startServerWithPortFallback',
        'isRecordOfUnknown', 'isRecordOfStrings', 'isNil'
      ];
      
      const unexpectedExports = exportedKeys.filter(key => !expectedExports.includes(key));
      expect(unexpectedExports).toEqual([]);
    });

    it('should export functions as functions', () => {
      const utilsIndex = require('../../utils/index');
      
      const functionExports = [
        'setVerbose', 'verboseLog', 'verboseError', 'verboseWarn',
        'withContext', 'debug', 'info', 'log', 'warn', 'error', 'verboseDebug', 'verboseInfo',
        'isObject', 'hasRequiredProperties', 'hasValidPropertyTypes', 'isValidHttpMethod',
        'normalizeUrl', 'extractQueryParams', 'findFirstNonEmptyMatch',
        'createResourceResponse', 'createSuccessResponse', 'createCreatedResponse', 'createUpdatedResponse',
        'isPortAvailable', 'findAvailablePort', 'startServerWithPortFallback',
        'isRecordOfUnknown', 'isRecordOfStrings', 'isNil'
      ];
      
      functionExports.forEach(funcName => {
        expect(typeof utilsIndex[funcName]).toBe('function');
      });
    });
  });

  describe('Module Integration', () => {
    it('should allow importing all functions from index', () => {
      const {
        setVerbose, verboseLog, verboseError, verboseWarn,
        withContext, debug, info, log, warn, error, verboseDebug, verboseInfo,
        isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod,
        normalizeUrl, extractQueryParams, findFirstNonEmptyMatch,
        createResourceResponse, createSuccessResponse, createCreatedResponse, createUpdatedResponse,
        isPortAvailable, findAvailablePort, startServerWithPortFallback,
        isRecordOfUnknown, isRecordOfStrings, isNil
      } = require('../../utils/index');
      
      expect(typeof setVerbose).toBe('function');
      expect(typeof verboseLog).toBe('function');
      expect(typeof verboseError).toBe('function');
      expect(typeof verboseWarn).toBe('function');
      expect(typeof withContext).toBe('function');
      expect(typeof debug).toBe('function');
      expect(typeof info).toBe('function');
      expect(typeof log).toBe('function');
      expect(typeof warn).toBe('function');
      expect(typeof error).toBe('function');
      expect(typeof verboseDebug).toBe('function');
      expect(typeof verboseInfo).toBe('function');
      expect(typeof isObject).toBe('function');
      expect(typeof hasRequiredProperties).toBe('function');
      expect(typeof hasValidPropertyTypes).toBe('function');
      expect(typeof isValidHttpMethod).toBe('function');
      expect(typeof normalizeUrl).toBe('function');
      expect(typeof extractQueryParams).toBe('function');
      expect(typeof findFirstNonEmptyMatch).toBe('function');
      expect(typeof createResourceResponse).toBe('function');
      expect(typeof createSuccessResponse).toBe('function');
      expect(typeof createCreatedResponse).toBe('function');
      expect(typeof createUpdatedResponse).toBe('function');
      expect(typeof isPortAvailable).toBe('function');
      expect(typeof findAvailablePort).toBe('function');
      expect(typeof startServerWithPortFallback).toBe('function');
      expect(typeof isRecordOfUnknown).toBe('function');
      expect(typeof isRecordOfStrings).toBe('function');
      expect(typeof isNil).toBe('function');
    });

    it('should maintain function references consistency', () => {
      const utilsIndex = require('../../utils/index');
      
      const utilsIndexAgain = require('../../utils/index');
      
      expect(utilsIndex.setVerbose).toBe(utilsIndexAgain.setVerbose);
      expect(utilsIndex.isObject).toBe(utilsIndexAgain.isObject);
      expect(utilsIndex.normalizeUrl).toBe(utilsIndexAgain.normalizeUrl);
      expect(utilsIndex.createResourceResponse).toBe(utilsIndexAgain.createResourceResponse);
      expect(utilsIndex.isPortAvailable).toBe(utilsIndexAgain.isPortAvailable);
      expect(utilsIndex.isRecordOfUnknown).toBe(utilsIndexAgain.isRecordOfUnknown);
    });
  });

  describe('Export Categories', () => {
    it('should categorize logger exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const loggerExports = ['setVerbose', 'verboseLog', 'verboseError', 'verboseWarn'];
      
      loggerExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });

    it('should categorize validation exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const validationExports = ['isObject', 'hasRequiredProperties', 'hasValidPropertyTypes', 'isValidHttpMethod'];
      
      validationExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });

    it('should categorize url-parser exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const urlParserExports = ['normalizeUrl', 'extractQueryParams', 'findFirstNonEmptyMatch'];
      
      urlParserExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });

    it('should categorize response-templates exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const responseTemplateExports = ['createResourceResponse', 'createSuccessResponse', 'createCreatedResponse', 'createUpdatedResponse'];
      
      responseTemplateExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });

    it('should categorize port-utils exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const portUtilExports = ['isPortAvailable', 'findAvailablePort', 'startServerWithPortFallback'];
      
      portUtilExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });

    it('should categorize typeguards exports correctly', () => {
      const utilsIndex = require('../../utils/index');
      const typeguardExports = ['isRecordOfUnknown', 'isRecordOfStrings', 'isNil'];
      
      typeguardExports.forEach(exportName => {
        expect(utilsIndex[exportName]).toBeDefined();
        expect(typeof utilsIndex[exportName]).toBe('function');
      });
    });
  });
});
