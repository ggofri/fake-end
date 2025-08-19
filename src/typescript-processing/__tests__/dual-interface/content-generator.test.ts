import { 
  StandardContentGenerator, 
  ErrorModeContentGenerator, 
  SuccessModeContentGenerator,
  contentGenerators 
} from '@/typescript-processing/dual-interface/content-generator';
import { CurlInfo, MockEndpoint } from '@/mock-generation/types';

describe('Content Generators', () => {
  const mockCurlInfo: CurlInfo = {
    method: 'GET',
    url: 'https://api.example.com/api/users/123',
    path: '/api/users/123',
    headers: {},
    data: '',
    queryParams: {}
  };

  const mockEndpoint: MockEndpoint = {
    method: 'GET',
    path: '/api/users/:id',
    status: 200,
    body: { id: 1, name: 'John' }
  };

  describe('StandardContentGenerator', () => {
    it('should generate standard content with default strategy', async () => {
      const generator = new StandardContentGenerator();
      const result = await generator.generate(mockCurlInfo, mockEndpoint);
      expect(typeof result).toBe('string');
    });

    it('should generate standard content with faker strategy', async () => {
      const generator = new StandardContentGenerator('faker');
      const result = await generator.generate(mockCurlInfo, mockEndpoint);
      expect(typeof result).toBe('string');
    });
  });

  describe('ErrorModeContentGenerator', () => {
    it('should generate error mode content', async () => {
      const generator = new ErrorModeContentGenerator();
      const result = await generator.generate(mockCurlInfo, mockEndpoint, '/tmp/test.ts');
      expect(typeof result).toBe('string');
      expect(result).toContain('ErrorResponse');
    });
  });

  describe('SuccessModeContentGenerator', () => {
    it('should generate success mode content', async () => {
      const generator = new SuccessModeContentGenerator();
      const result = await generator.generate(mockCurlInfo, mockEndpoint, '/tmp/test.ts');
      expect(typeof result).toBe('string');
      expect(result).toContain('SuccessResponse');
    });
  });

  describe('contentGenerators exports', () => {
    it('should export all generator instances', () => {
      expect(contentGenerators.standard).toBeInstanceOf(StandardContentGenerator);
      expect(contentGenerators.error).toBeInstanceOf(ErrorModeContentGenerator);
      expect(contentGenerators.success).toBeInstanceOf(SuccessModeContentGenerator);
    });
  });
});
