# Vertical Slice Architecture

## Architectural Overview
Fake-End is a CLI tool for mocking backend APIs using YAML files, organized into vertical slices that encapsulate complete features and capabilities.

## Vertical Slices

### 1. Mock Generation Feature
**Description:** Core functionality for generating mock API endpoints
**Files:**
- `/src/cli/generate/index.ts`
- `/src/cli/generate/core/mock-generator.ts`
- `/src/cli/generate/strategies/base.ts`
- `/src/cli/generate/strategies/basic-response.ts`
- `/src/cli/generate/strategies/ollama-response.ts`
- `/src/cli/generate/strategies/actual-response.ts`
- `/src/cli/generate/strategies/factory.ts`
- `/src/cli/generate/processors/response-generator.ts`
- `/src/cli/generate/processors/curl-command.ts`
- `/src/cli/generate/processors/execution-decision.ts`

### 2. Server Configuration and Express Handling
**Description:** Server setup, routing, and HTTP handling
**Files:**
- `/src/server/express/index.ts`
- `/src/server/express/handlers/endpoint-handler.ts`
- `/src/server/express/handlers/error-handler.ts`
- `/src/server/express/middleware/index.ts`
- `/src/server/express/utils/parameter-interpolator.ts`
- `/src/server/loader.ts`
- `/src/server/path-builder.ts`

### 3. TypeScript Parsing and Interface Generation
**Description:** TypeScript-specific parsing, interface extraction, and type handling
**Files:**
- `/src/server/typescript/index.ts`
- `/src/server/typescript/parsers/interface-parser.ts`
- `/src/server/typescript/generators/mock-generator.ts`
- `/src/server/typescript/utils/ts-path-extractor.ts`
- `/src/server/typescript/utils/jsdoc-extractor.ts`
- `/src/server/typescript/utils/mock-value-resolver.ts`
- `/src/server/typescript/utils/mock-value-evaluator.ts`
- `/src/server/typescript/validators/endpoint-validator.ts`

### 4. CLI Command Handling
**Description:** Command-line interface and runtime execution
**Files:**
- `/src/cli/index.ts`
- `/src/cli/run.ts`
- `/bin.js`
- `/register.js`

### 5. Utility Services
**Description:** Cross-cutting utility functions and helper modules
**Files:**
- `/src/utils/index.ts`
- `/src/utils/logger.ts`
- `/src/utils/url-parser.ts`
- `/src/utils/validation.ts`
- `/src/utils/response-templates.ts`

### 6. Constants and Configuration
**Description:** Application-wide constants and configuration settings
**Files:**
- `/src/constants/index.ts`
- `/src/constants/http.ts`
- `/src/constants/timing.ts`
- `/src/constants/format.ts`
- `/src/constants/mock.ts`
- `/src/constants/ollama.ts`
- `/src/constants/buffer.ts`

### 7. Type Definitions
**Description:** Type safety and interface definitions
**Files:**
- `/src/types/index.ts`
- `/src/cli/generate/types/index.ts`
- `/src/cli/generate/types/typeguards.ts`
