# Fake-End E2E Test Suite (Risk-Driven)

This directory contains a **focused, risk-driven end-to-end test suite** for the fake-end CLI tool. The tests are designed to catch real issues that affect users, rather than testing configuration or framework behavior.

## Philosophy

This test suite follows a **minimalistic, risk-driven approach**:
- ✅ **Test real user workflows** that could break in production
- ✅ **Test actual failure scenarios** users encounter
- ✅ **Test integration between components** (server, CLI, filesystem)
- ❌ Don't test framework behavior (Express, YAML parsing, etc.)
- ❌ Don't test artificial edge cases that don't occur in real usage
- ❌ Don't test configuration that just verifies what was put in

## Test Structure

### Focused Test Categories (30 tests total)

1. **Core Functionality** (`core-functionality.test.ts`) - 5 tests
   - Basic HTTP method support (GET, POST)
   - Body interpolation with real data  
   - 404 handling for missing routes
   - Concurrent request stability
   - Error recovery scenarios

2. **TypeScript Interface Support** (`typescript-interfaces.test.ts`) - 6 tests
   - TypeScript interface files as mock endpoints
   - JSDoc `@mock` comment processing
   - Realistic mock data generation from interfaces
   - POST requests to TypeScript endpoints
   - Mixed YAML and TypeScript files
   - TypeScript syntax error handling

3. **File Watching & Hot Reload** (`file-watching.test.ts`) - 3 tests
   - New mock files added while server running ⚠️ *Missing Feature*
   - Mock file modifications during runtime ⚠️ *Missing Feature*
   - Invalid YAML syntax handling

3. **CLI Core Operations** (`cli-core.test.ts`) - 6 tests
   - Server startup with valid mock directory
   - Graceful failure with non-existent directory
   - Port conflict handling
   - Version and help commands
   - Real CLI binary execution

4. **Error Scenarios & Edge Cases** (`error-scenarios.test.ts`) - 5 tests
   - 404 for undefined routes
   - 405 for unsupported methods
   - Malformed JSON handling
   - Missing request body handling
   - Timeout scenarios

5. **Performance Critical Scenarios** (`performance-critical.test.ts`) - 5 tests
   - Concurrent load handling (realistic load)
   - POST requests under load
   - Sustained load stability
   - Error condition recovery
   - Multiple endpoints efficiency

## Test Results Overview

- **✅ ~15 passing tests** - Core functionality working
- **❌ ~15 failing tests** - Indicate real missing features or bugs

**Key Missing Features Identified:**
- TypeScript interface support with @mock comments (major feature)
- File watching/hot reload (critical developer workflow)
- Some CLI error handling improvements needed
- Performance optimizations for concurrent load

## Test Utilities (Cleaned Up)

### Core Utilities
- **`createTestContext()`** - Sets up test environment with server + client
- **`cleanupTestContext()`** - Proper cleanup after tests
- **`createYamlMockFile()`** - Generates YAML mock configurations
- **`TestServerManager`** - Manages server instances for testing
- **`HttpClient`** - Makes HTTP requests to test servers

### Removed (Unused)
- TypeScript interface generation utilities
- Complex templating helpers
- Artificial security test utilities
- Response time validation utilities

## Running Tests

### Quick Start
```bash
# Run all focused tests
bun test:e2e

# Or use the enhanced test runner
./tests/run-e2e.sh
```

### Prerequisites
- Node.js (v18+)
- Bun package manager
- Built project (`bun run build`)

### Run Specific Test Categories
```bash
# Core functionality only
bun test tests/e2e/core-functionality.test.ts

# File watching tests (will show missing features)
bun test tests/e2e/file-watching.test.ts

# CLI operations
bun test tests/e2e/cli-core.test.ts
```

## Understanding Test Failures

### ✅ **Passing Tests = Working Features**
When tests pass, it means the core functionality is working correctly for real user scenarios.

### ❌ **Failing Tests = Real Issues**
When tests fail in this focused suite, it indicates:
1. **Missing features** that users expect (e.g., file watching)
2. **Real bugs** that affect user workflows
3. **Performance issues** under realistic load
4. **CLI usability problems** that frustrate users

This is much more valuable than the previous 119 tests where many failures were just configuration mismatches.

## Development Priorities

Based on test failures, development should focus on:

1. **🔥 Critical**: File watching/hot reload - core developer workflow
2. **⚠️ High**: CLI error handling - better user experience  
3. **📊 Medium**: Performance optimization - sustained load handling
4. **🔧 Low**: Advanced templating edge cases

## Test Suite Transformation

### Before Cleanup
- **119 tests** (mostly non-valuable)
- **24% pass rate** with artificial failures
- **10+ minute runtime**
- Tests verified YAML parsing, framework behavior, artificial edge cases

### After Cleanup  
- **30 tests** (all valuable)
- **~50% pass rate** with meaningful failures
- **2-3 minute runtime**
- Tests verify real user workflows and catch actual issues

## Best Practices

### Test Design Principles
1. **Risk-Driven**: Each test catches a real user issue
2. **Integration-Focused**: Test server-client-filesystem interaction
3. **Realistic Scenarios**: Use actual user workflows
4. **Meaningful Failures**: Failures indicate real problems

### Test Isolation
- Each test creates temporary mock directories
- Servers run on random ports
- Proper cleanup prevents test pollution
- Sequential execution avoids race conditions

## Contributing

When adding new tests:

1. **Ask: "Does this test catch a real user issue?"**
2. **Focus on integration, not unit testing**
3. **Test workflows, not configuration**
4. **Make failures meaningful and actionable**
5. **Keep the suite focused and fast**

### Adding Tests
```typescript
// ✅ Good: Tests real user workflow
it('should detect new mock files during development', async () => {
  // Test adding mock file while server running
});

// ❌ Bad: Tests configuration parsing
it('should parse YAML with specific indentation', async () => {
  // This just tests YAML library
});
```

## Debugging

### Enable Verbose Output
```bash
export TEST_VERBOSE=1
bun test:e2e --verbose
```

### Manual Cleanup
```bash
# Kill orphaned test processes
pkill -f fake-end
pkill -f bin.js

# Clean temp directories
rm -rf tests/fixtures/test-mock-*
```

---

**🎯 This test suite catches real issues that affect users, making it a valuable development tool rather than a maintenance burden.**