#!/usr/bin/env bun

import { Command } from 'commander';
import { startServer } from './run';
import { generateMockFromCurl } from '@/mock-generation';
import { error } from '@/shared/utils/logger';

interface RunOptions {
  port: string;
  dir: string;
  verbose?: boolean;
  noCache?: boolean;
  dynamicMocks?: boolean;
  watch?: boolean;
}

interface GenerateOptions {
  curl?: string;
  file?: string;
  output: string;
  execute?: boolean;
  ollama?: boolean;
  ollamaModel: string;
  ollamaHost: string;
  yaml?: boolean;
  mockStrategy?: 'sanitize' | 'real' | 'faker';
}

const program = new Command();

program
  .name('fake-end')
  .description('A modern CLI tool for mocking backend APIs using YAML files')
  .version('1.0.0');

program
  .command('run')
  .description('Start the mock server')
  .option('-p, --port <port>', 'Port to run the server on', '4000')
  .option('-d, --dir <directory>', 'Directory containing mock YAML files', 'mock_server')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--no-cache', 'Disable TypeScript interface caching for development')
  .option('--dynamic-mocks', 'Execute mock functions on each request instead of at startup')
  .option('--watch', 'Enable hot reload for mock files and source code changes')
  .action(async (options: RunOptions) => {
    try {
      await startServer({
        port: parseInt(options.port, 10),
        mockDir: options.dir,
        verbose: options.verbose ?? false,
        noCache: options.noCache ?? false,
        dynamicMocks: options.dynamicMocks ?? false,
        watch: options.watch ?? false
      });
    } catch (err) {
      error('Error starting server:', err);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate TypeScript interface mock files from cURL commands (use --yaml for YAML format)')
  .option('-c, --curl <curl>', 'cURL command to analyze and mock')
  .option('-f, --file <file>', 'File containing cURL command')
  .option('-o, --output <output>', 'Output directory for generated mock files', 'mock_server')
  .option('--execute', 'Force execution of the cURL command to capture actual response')
  .option('--no-execute', 'Skip execution and infer response structure instead')
  .option('--ollama', 'Use Ollama for AI-powered response generation (only used if --execute fails)')
  .option('--ollama-model <model>', 'Ollama model to use', 'qwen2.5-coder:0.5b')
  .option('--ollama-host <host>', 'Ollama host URL', 'http://localhost:11434')
  .option('--yaml', 'Generate YAML files instead of TypeScript interfaces (default: TypeScript)')
  .option('--use-real-values', 'Use actual API response values for all fields')
  .option('--use-faker', 'Use faker.js generated values for all fields')
  .option('--sanitize', 'Use real values but replace sensitive fields with faker.js values (default)')
  .option('--error', 'Generate error response and create dual-interface guard structure')
  .option('--success', 'Generate success response and create dual-interface guard structure')
  .action(async (options: GenerateOptions & { useRealValues?: boolean; useFaker?: boolean; sanitize?: boolean; error?: boolean; success?: boolean }) => {
    try {
      
      let mockStrategy: 'sanitize' | 'real' | 'faker' = 'sanitize';
      if (options.useRealValues) mockStrategy = 'real';
      else if (options.useFaker) mockStrategy = 'faker';
      else if (options.sanitize === false) mockStrategy = 'real'; 
      
      const generateOptions: GenerateOptions = {
        ...options,
        mockStrategy
      };
      
      await generateMockFromCurl(generateOptions);
    } catch (err) {
      error('Error generating mock:', err);
      process.exit(1);
    }
  });

program.parse();
