export * from './typeguards'

export interface CurlSource {
  curl?: string;
  file?: string;
}

export interface OutputConfig {
  output: string;
}

export interface ExecutionConfig {
  execute?: boolean;
}

export interface OllamaConfig {
  ollama?: boolean;
  ollamaModel: string;
  ollamaHost: string;
}

export interface GenerateOptions extends CurlSource, OutputConfig, ExecutionConfig, OllamaConfig {}

export interface CurlInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
  path: string;
  queryParams: Record<string, string>;
}

export interface MockEndpoint {
  method: string;
  path: string;
  status: number;
  body: Record<string, unknown> | Array<unknown> | string | number | boolean;
  headers?: Record<string, string>;
  delayMs?: number;
}

export interface Logger {
  logAnalyzing(): void;
  logParsed(method: string, path: string): void;
  logExecuting(): void;
  logSuccess(filePath: string, endpoint: MockEndpoint): void;
}

export interface CurlProcessor {
  getCurlCommand(source: CurlSource): Promise<string>;
}

export interface ExecutionDecider {
  shouldExecuteCurl(config: ExecutionConfig): Promise<boolean>;
}

export interface ResponseStrategy {
  generateResponse(curlInfo: CurlInfo): Record<string, unknown> | Array<unknown> | string | number | boolean | Promise<Record<string, unknown> | Array<unknown> | string | number | boolean>;
}

export interface EndpointFactory {
  create(curlInfo: CurlInfo, response: unknown, outputDir: string): MockEndpoint;
}

export interface FileManager {
  ensureOutputDirectory(path: string): Promise<void>;
  writeEndpointFile(curlInfo: CurlInfo, output: string, endpoint: MockEndpoint): Promise<string>;
}

export interface MockGeneratorDependencies {
  logger: Logger;
  curlProcessor: CurlProcessor;
  executionDecider: ExecutionDecider;
  responseGenerator: ResponseGenerator;
  endpointFactory: EndpointFactory;
  fileManager: FileManager;
}

export interface ResponseGenerator {
  generateResponse(
    curlInfo: CurlInfo,
    actualResponse: string | null,
    options: GenerateOptions
  ): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean>;
}

export interface OllamaResponse {
  response: string;
}
