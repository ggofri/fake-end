import { generatePersonalStringValue } from '@/typescript-processing/utils/generators/personal-generator';

describe('personal-generator', () => {
  describe('generatePersonalStringValue', () => {
    it('should generate first name', () => {
      const result = generatePersonalStringValue('firstname');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate last name', () => {
      const result = generatePersonalStringValue('lastname');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate full name', () => {
      const result = generatePersonalStringValue('name');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate username', () => {
      const result = generatePersonalStringValue('username');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate password', () => {
      const result = generatePersonalStringValue('password');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate email', () => {
      const result = generatePersonalStringValue('email');
      expect(typeof result).toBe('string');
      expect(result).toContain('@');
    });

    it('should generate phone number', () => {
      const result = generatePersonalStringValue('phone');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate UUID for id fields', () => {
      const result = generatePersonalStringValue('id');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should not generate UUID for email id', () => {
      const result = generatePersonalStringValue('emailid');
      expect(result).toContain('@');
    });

    it('should return null for unknown fields', () => {
      const result = generatePersonalStringValue('unknown');
      expect(result).toBeNull();
    });

    it('should handle fname and lname abbreviations', () => {
      expect(generatePersonalStringValue('fname')).not.toBeNull();
      expect(generatePersonalStringValue('lname')).not.toBeNull();
    });

    it('should handle fullname', () => {
      const result = generatePersonalStringValue('fullname');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });
  });
});
