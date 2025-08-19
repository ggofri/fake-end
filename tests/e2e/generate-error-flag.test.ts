import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Generate Command --error Flag E2E', () => {
  let mockDir: string;
  let testFilePath: string;
  
  beforeAll(async () => {
    mockDir = join(__dirname, '../fixtures/temp-error-test');
    
    if (!existsSync(mockDir)) {
      execSync(`mkdir -p "${mockDir}"`);
    }
  });

  beforeEach(() => {
    testFilePath = join(mockDir, 'users.post.ts');
    
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  afterAll(() => {
    
    if (existsSync(mockDir)) {
      execSync(`rm -rf "${mockDir}"`);
    }
  });

  describe('New file generation with --error flag', () => {
    it('should generate dual interface structure for new endpoint', () => {
      const curlCommand = `curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name": "", "email": null}'`;
      const generateCommand = `cd "${process.cwd()}" && bun run dev generate --curl "${curlCommand}" --output="${mockDir}" --error --no-execute`;
      
      const result = execSync(generateCommand, { 
        encoding: 'utf-8',
        timeout: 30000 
      });

      expect(result).toContain('Mock file generated');
      expect(existsSync(testFilePath)).toBe(true);

      const fileContent = readFileSync(testFilePath, 'utf-8');
      
      expect(fileContent).toContain('@guard');
      expect(fileContent).toContain('"left":');
      expect(fileContent).toContain('"right":');
      expect(fileContent).toContain('ErrorResponse');
      expect(fileContent).toContain('SuccessResponse');
      
      expect(fileContent).toContain('export interface ErrorResponse');
      expect(fileContent).toContain('export interface SuccessResponse');
      
      expect(fileContent).toContain('interface UsersPost');
      expect(fileContent).toContain('export default UsersPost');
    });
  });

  describe('Existing file modification with --error flag', () => {
    it('should convert existing file to dual interface structure', () => {
      
      const existingContent = `interface UsersPost {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default UsersPost;`;
      
      writeFileSync(testFilePath, existingContent, 'utf-8');

      const curlCommand = `curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name": "", "email": "invalid"}'`;
      const generateCommand = `cd "${process.cwd()}" && bun run dev generate --curl "${curlCommand}" --output="${mockDir}" --error --no-execute`;
      
      const result = execSync(generateCommand, {
        encoding: 'utf-8',
        timeout: 30000
      });

      expect(result).toContain('Mock file generated');
      
      const updatedContent = readFileSync(testFilePath, 'utf-8');
      
      expect(updatedContent).toContain('@guard');
      
      expect(updatedContent).toContain('export interface ErrorResponse');
      
      expect(updatedContent).toContain('export interface SuccessResponse');
      expect(updatedContent).toContain('id: string');
      expect(updatedContent).toContain('name: string');
      expect(updatedContent).toContain('email: string');
      expect(updatedContent).toContain('createdAt: string');
      
      expect(updatedContent).toContain('interface UsersPost');
      expect(updatedContent).toContain('export default UsersPost');
    });
  });

  describe('Guard condition inference', () => {
    it('should infer appropriate guard conditions from curl parameters', () => {
      const curlCommand = `curl -X POST https://api.example.com/admin/users -H "Content-Type: application/json" -d '{"name": "", "role": "user"}'`;
      const generateCommand = `cd "${process.cwd()}" && bun run dev generate --curl "${curlCommand}" --output="${mockDir}" --error --no-execute`;

      const result = execSync(generateCommand, {
        encoding: 'utf-8', 
        timeout: 30000
      });

      expect(result).toContain('Mock file generated');
      
      const adminTestFilePath = join(mockDir, 'admin/users.post.ts');
      const fileContent = readFileSync(adminTestFilePath, 'utf-8');
      
      expect(fileContent).toContain('@guard');
      expect(fileContent).toContain('"condition"');
      expect(fileContent).toContain('"left"');
      expect(fileContent).toContain('"right"');
      expect(fileContent).toContain('"status": 403');
      expect(fileContent).toContain('"status": 200');
      expect(fileContent).toContain('"field": "user.role"');
      expect(fileContent).toContain('"operator": "equals"');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed curl commands gracefully', () => {
      const malformedCurl = 'invalid curl command';
      const generateCommand = `cd "${process.cwd()}" && bun run dev generate --curl "${malformedCurl}" --output="${mockDir}" --error --no-execute`;

      const result = execSync(generateCommand, { 
        encoding: 'utf-8',
        timeout: 10000
      });
      
      expect(result).toContain('Mock file generated');
      const expectedPath = join(mockDir, 'api.get.ts');
      expect(existsSync(expectedPath)).toBe(true);
    });

    it('should handle existing files with parse errors gracefully', () => {
      
      const malformedContent = 'invalid typescript content {{{';
      writeFileSync(testFilePath, malformedContent, 'utf-8');

      const curlCommand = `curl -X POST https://api.example.com/users -d '{"test": true}'`;
      const generateCommand = `cd "${process.cwd()}" && bun run dev generate --curl "${curlCommand}" --output="${mockDir}" --error --no-execute`;
      
      const result = execSync(generateCommand, {
        encoding: 'utf-8',
        timeout: 30000
      });

      expect(result).toContain('Mock file generated');
      expect(existsSync(testFilePath)).toBe(true);
      
      const newContent = readFileSync(testFilePath, 'utf-8');
      expect(newContent).toContain('interface UsersPost');
      expect(newContent).toContain('@guard');
    });
  });
});
