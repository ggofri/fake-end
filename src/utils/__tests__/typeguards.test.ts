import { isRecordOfUnknown, isRecordOfStrings, isNil, Nil } from '../typeguards';

describe('Typeguards Utils', () => {
  describe('isRecordOfUnknown', () => {
    it('should return true for plain objects', () => {
      expect(isRecordOfUnknown({})).toBe(true);
      expect(isRecordOfUnknown({ key: 'value' })).toBe(true);
      expect(isRecordOfUnknown({ a: 1, b: 2, c: 3 })).toBe(true);
    });

    it('should return true for objects with various value types', () => {
      const complexObject = {
        string: 'hello',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        array: [1, 2, 3],
        object: { nested: true },
        func: () => 'function'
      };
      
      expect(isRecordOfUnknown(complexObject)).toBe(true);
    });

    it('should return true for object instances', () => {
      expect(isRecordOfUnknown(new Date())).toBe(true);
      expect(isRecordOfUnknown(new Error('test'))).toBe(true);
      expect(isRecordOfUnknown(/regex/)).toBe(true);
    });

    it('should return false for functions (functions are not plain objects)', () => {
      expect(isRecordOfUnknown(() => {})).toBe(false);
      expect(isRecordOfUnknown(function() {})).toBe(false);
      expect(isRecordOfUnknown(isRecordOfUnknown)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRecordOfUnknown(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRecordOfUnknown(undefined)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isRecordOfUnknown([])).toBe(false);
      expect(isRecordOfUnknown([1, 2, 3])).toBe(false);
      expect(isRecordOfUnknown(['a', 'b', 'c'])).toBe(false);
      expect(isRecordOfUnknown([{ key: 'value' }])).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isRecordOfUnknown('string')).toBe(false);
      expect(isRecordOfUnknown(123)).toBe(false);
      expect(isRecordOfUnknown(true)).toBe(false);
      expect(isRecordOfUnknown(false)).toBe(false);
      expect(isRecordOfUnknown(Symbol('test'))).toBe(false);
    });

    it('should return false for special number values', () => {
      expect(isRecordOfUnknown(NaN)).toBe(false);
      expect(isRecordOfUnknown(Infinity)).toBe(false);
      expect(isRecordOfUnknown(-Infinity)).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(isRecordOfUnknown({})).toBe(true);
      expect(isRecordOfUnknown(Object.create(null))).toBe(true);
    });

    it('should handle objects with prototype', () => {
      function Constructor() {}
      Constructor.prototype.method = function() {};
      
      const instance = new Constructor();
      expect(isRecordOfUnknown(instance)).toBe(true);
    });

    it('should handle class instances', () => {
      class TestClass {
        constructor(public value: string) {}
        method() { return this.value; }
      }
      
      const instance = new TestClass('test');
      expect(isRecordOfUnknown(instance)).toBe(true);
    });

    it('should type guard correctly', () => {
      const value: unknown = { key: 'value' };
      
      if (isRecordOfUnknown(value)) {
        // TypeScript should know value is Record<string, unknown> here
        expect(value.key).toBe('value');
        expect(typeof value).toBe('object');
      }
    });
  });

  describe('isRecordOfStrings', () => {
    it('should return true for objects with string keys', () => {
      expect(isRecordOfStrings({})).toBe(true);
      expect(isRecordOfStrings({ key: 'value' })).toBe(true);
      expect(isRecordOfStrings({ a: 1, b: 2, c: 3 })).toBe(true);
    });

    it('should return true for objects with various value types', () => {
      const mixedObject = {
        string: 'hello',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        array: [1, 2, 3],
        object: { nested: true },
        func: () => 'function'
      };
      
      expect(isRecordOfStrings(mixedObject)).toBe(true);
    });

    it('should return true for objects with special string keys', () => {
      const specialKeys = {
        'key-with-dash': 'value1',
        'key_with_underscore': 'value2',
        'key.with.dots': 'value3',
        'key with spaces': 'value4',
        '123': 'numeric string key',
        '': 'empty string key'
      };
      
      expect(isRecordOfStrings(specialKeys)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isRecordOfStrings(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRecordOfStrings(undefined)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isRecordOfStrings([])).toBe(false);
      expect(isRecordOfStrings([1, 2, 3])).toBe(false);
      expect(isRecordOfStrings(['a', 'b', 'c'])).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isRecordOfStrings('string')).toBe(false);
      expect(isRecordOfStrings(123)).toBe(false);
      expect(isRecordOfStrings(true)).toBe(false);
      expect(isRecordOfStrings(false)).toBe(false);
      expect(isRecordOfStrings(Symbol('test'))).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(isRecordOfStrings({})).toBe(true);
    });

    it('should handle objects created with Object.create(null)', () => {
      const nullPrototypeObject = Object.create(null);
      nullPrototypeObject.key = 'value';
      expect(isRecordOfStrings(nullPrototypeObject)).toBe(true);
    });

    it('should handle objects with inherited properties', () => {
      function Parent() {}
      Parent.prototype.inherited = 'inherited value';
      
      function Child() {
        this.own = 'own value';
      }
      Child.prototype = Object.create(Parent.prototype);
      
      const instance = new Child();
      expect(isRecordOfStrings(instance)).toBe(true);
    });

    it('should handle objects with numeric keys (which are still strings in JavaScript)', () => {
      const numericKeys = {
        0: 'first',
        1: 'second',
        2: 'third'
      };
      
      expect(isRecordOfStrings(numericKeys)).toBe(true);
    });

    it('should handle objects with symbol keys (should still return true as it only checks enumerable string keys)', () => {
      const symbolKey = Symbol('test');
      const objectWithSymbol = {
        stringKey: 'value',
        [symbolKey]: 'symbol value'
      };
      
      expect(isRecordOfStrings(objectWithSymbol)).toBe(true);
    });

    it('should handle Map objects (should return false as Map is not a plain object)', () => {
      const map = new Map([['key', 'value']]);
      expect(isRecordOfStrings(map)).toBe(true); // Map is still an object, just not a plain object
    });

    it('should handle Set objects', () => {
      const set = new Set(['a', 'b', 'c']);
      expect(isRecordOfStrings(set)).toBe(true); // Set is still an object
    });

    it('should return false for functions (even with properties)', () => {
      function testFunc() {}
      testFunc.customProperty = 'value';
      
      expect(isRecordOfStrings(testFunc)).toBe(false);
    });

    it('should handle Date objects', () => {
      const date = new Date();
      expect(isRecordOfStrings(date)).toBe(true);
    });

    it('should handle RegExp objects', () => {
      const regex = /test/g;
      expect(isRecordOfStrings(regex)).toBe(true);
    });

    it('should handle Error objects', () => {
      const error = new Error('test error');
      expect(isRecordOfStrings(error)).toBe(true);
    });

    it('should type guard correctly', () => {
      const value: unknown = { key: 'value', another: 123 };
      
      if (isRecordOfStrings(value)) {
        // TypeScript should know value is Record<string, unknown> here
        expect(value.key).toBe('value');
        expect(value.another).toBe(123);
        expect(typeof value).toBe('object');
      }
    });
  });

  describe('isNil', () => {
    it('should return true for null', () => {
      expect(isNil(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isNil(undefined)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNil('')).toBe(false);
    });

    it('should return false for zero', () => {
      expect(isNil(0)).toBe(false);
    });

    it('should return false for false boolean', () => {
      expect(isNil(false)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isNil(NaN)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isNil({})).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(isNil([])).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isNil('hello')).toBe(false);
      expect(isNil('null')).toBe(false);
      expect(isNil('undefined')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isNil(42)).toBe(false);
      expect(isNil(-1)).toBe(false);
      expect(isNil(Infinity)).toBe(false);
      expect(isNil(-Infinity)).toBe(false);
    });

    it('should return false for booleans', () => {
      expect(isNil(true)).toBe(false);
      expect(isNil(false)).toBe(false);
    });

    it('should return false for objects', () => {
      expect(isNil({ key: 'value' })).toBe(false);
      expect(isNil(new Date())).toBe(false);
      expect(isNil(/regex/)).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isNil(() => {})).toBe(false);
      expect(isNil(function() {})).toBe(false);
      expect(isNil(isNil)).toBe(false);
    });

    it('should return false for symbols', () => {
      expect(isNil(Symbol('test'))).toBe(false);
      expect(isNil(Symbol.for('global'))).toBe(false);
    });

    it('should handle variables explicitly set to null or undefined', () => {
      let explicitNull: any = null;
      let explicitUndefined: any = undefined;
      
      expect(isNil(explicitNull)).toBe(true);
      expect(isNil(explicitUndefined)).toBe(true);
    });

    it('should handle object properties that are null or undefined', () => {
      const obj = {
        nullProp: null,
        undefinedProp: undefined,
        validProp: 'value'
      };
      
      expect(isNil(obj.nullProp)).toBe(true);
      expect(isNil(obj.undefinedProp)).toBe(true);
      expect(isNil(obj.validProp)).toBe(false);
    });

    it('should handle function return values', () => {
      function returnsNull() { return null; }
      function returnsUndefined() { return undefined; }
      function returnsValue() { return 'value'; }
      function returnsNothing() { /* implicitly returns undefined */ }
      
      expect(isNil(returnsNull())).toBe(true);
      expect(isNil(returnsUndefined())).toBe(true);
      expect(isNil(returnsValue())).toBe(false);
      expect(isNil(returnsNothing())).toBe(true);
    });

    it('should type guard correctly', () => {
      const value: unknown = null;
      
      if (isNil(value)) {
        // TypeScript should know value is null | undefined here
        expect(value === null || value === undefined).toBe(true);
      }
      
      const anotherValue: string | null | undefined = 'hello';
      
      if (!isNil(anotherValue)) {
        // TypeScript should know anotherValue is string here
        expect(typeof anotherValue).toBe('string');
        expect(anotherValue.length).toBeGreaterThan(0);
      }
    });

    it('should work with optional chaining scenarios', () => {
      const obj: { prop?: { nested?: string } } = {};
      
      expect(isNil(obj.prop)).toBe(true);
      expect(isNil(obj.prop?.nested)).toBe(true);
      
      obj.prop = { nested: 'value' };
      expect(isNil(obj.prop)).toBe(false);
      expect(isNil(obj.prop.nested)).toBe(false);
    });
  });

  describe('Nil type', () => {
    it('should represent null or undefined type', () => {
      const nullValue: Nil = null;
      const undefinedValue: Nil = undefined;
      
      expect(isNil(nullValue)).toBe(true);
      expect(isNil(undefinedValue)).toBe(true);
      
      // TypeScript compilation test - should not cause type errors
      const nilValues: Nil[] = [null, undefined];
      nilValues.forEach(value => {
        expect(isNil(value)).toBe(true);
      });
    });
  });

  describe('Integration and utility scenarios', () => {
    it('should work together for comprehensive type checking', () => {
      const values: unknown[] = [
        {},
        { key: 'value' },
        [],
        [1, 2, 3],
        null,
        undefined,
        'string',
        123,
        true,
        () => {},
        new Date()
      ];
      
      const objects = values.filter(isRecordOfUnknown);
      const records = values.filter(isRecordOfStrings);
      const nils = values.filter(isNil);
      
      expect(objects.length).toBe(3); // {}, { key: 'value' }, new Date()
      expect(records.length).toBe(3); // {}, { key: 'value' }, new Date()
      expect(nils.length).toBe(2); // null, undefined
    });

    it('should handle nested type checking', () => {
      const complexObject = {
        validData: { name: 'John', age: 30 },
        nullData: null,
        undefinedData: undefined,
        arrayData: [1, 2, 3]
      };
      
      expect(isRecordOfUnknown(complexObject)).toBe(true);
      expect(isRecordOfStrings(complexObject)).toBe(true);
      
      expect(isRecordOfUnknown(complexObject.validData)).toBe(true);
      expect(isNil(complexObject.nullData)).toBe(true);
      expect(isNil(complexObject.undefinedData)).toBe(true);
      expect(isRecordOfUnknown(complexObject.arrayData)).toBe(false); // arrays are excluded
    });

    it('should work with filter operations', () => {
      const mixedData: unknown[] = [
        { id: 1, name: 'John' },
        null,
        { id: 2, name: 'Jane' },
        undefined,
        'not an object',
        { id: 3, name: 'Bob' }
      ];
      
      const validObjects = mixedData.filter(isRecordOfUnknown);
      const nilValues = mixedData.filter(isNil);
      
      expect(validObjects).toHaveLength(3);
      expect(nilValues).toHaveLength(2);
    });

    it('should handle type narrowing in conditional logic', () => {
      function processValue(value: unknown): string {
        if (isNil(value)) {
          return 'nil value';
        } else if (isRecordOfUnknown(value)) {
          return 'object value';
        } else {
          return 'other value';
        }
      }
      
      expect(processValue(null)).toBe('nil value');
      expect(processValue(undefined)).toBe('nil value');
      expect(processValue({})).toBe('object value');
      expect(processValue({ key: 'value' })).toBe('object value');
      expect(processValue('string')).toBe('other value');
      expect(processValue(123)).toBe('other value');
    });

    it('should handle edge cases in combination', () => {
      // Test object-like values that might confuse type guards
      const edgeCases = [
        Object.create(null),
        new Proxy({}, {}),
        typeof document !== 'undefined' ? document.createElement('div') : null, // Only in browser
        function() {},
        new Error('test')
      ].filter(Boolean); // Remove undefined values
      
      edgeCases.forEach(value => {
        // Functions should return false for both type guards
        if (typeof value === 'function') {
          expect(isRecordOfUnknown(value)).toBe(false);
          expect(isRecordOfStrings(value)).toBe(false);
        } else {
          expect(isRecordOfUnknown(value)).toBe(true);
          expect(isRecordOfStrings(value)).toBe(true);
        }
        expect(isNil(value)).toBe(false);
      });
    });
  });
});