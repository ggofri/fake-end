# Fake-End

A modern TypeScript CLI tool for mocking backend APIs using YAML files. **Built with Bun by design** for TypeScript-native performance and seamless `.ts` file execution without compilation. Perfect for frontend developers who need to simulate backend APIs during development.

## Features

- ⚡ **Bun-Native Performance**: Built with Bun for TypeScript-native execution without compilation
- 🚀 **Fast Setup**: Get a mock API server running in seconds
- 📝 **YAML Configuration**: Define your mock endpoints in simple YAML files
- 🔄 **Path Parameters**: Support for dynamic route parameters (e.g., `/users/:id`)
- 🎯 **Response Templating**: Interpolate request data into responses
- ⏱️ **Latency Simulation**: Add realistic delays to your mock responses
- 🌈 **Beautiful Logging**: Colorful console output with request details
- 📁 **Folder Structure**: Organize your mocks with nested folder structures
- 🤖 **AI-Powered Generation**: Generate mocks from cURL commands using Ollama AI
- 🎭 **Realistic Mock Data**: Automatic realistic data generation with Faker.js
- 📘 **TypeScript Integration**: Generate mocks from TypeScript interface definitions
- ⚡ **Hot Reload**: Automatic reload when YAML files change
- 🔧 **Advanced CLI Options**: Verbose logging, caching control, and dynamic mocks
- 🎨 **Custom Mock Values**: Static and dynamic mock values with `@mock` directives
- 🏗️ **Strict Type Generation**: Generate accurate TypeScript interfaces from API responses
- 🛡️ **Guard Functions**: Conditional logic with Either pattern for request validation
- 🔀 **Either Pattern**: Left/Right pattern support for error handling
- 🎲 **Dynamic Functions**: Execute custom JavaScript functions for each request
- 📊 **Contract Generation**: Use generated interfaces as API contracts

## Installation

```bash
npm install -g fake-end
```

Or use it directly with npx:

```bash
npx fake-end run
```

> **Note**: While distributed via npm for compatibility, Fake-End is built with Bun and leverages its TypeScript-native capabilities for optimal performance. The tool can execute `.ts` files directly without compilation, making it perfect for TypeScript-first development workflows.

## Quick Start

1. Create a `mock_server` directory in your project root
2. Add YAML files with your mock endpoint definitions
3. Run the server

```bash
mkdir mock_server
echo "- method: GET
  path: /hello
  status: 200
  body:
    message: 'Hello, World!'" > mock_server/hello.yaml

npx fake-end run
```

Your mock server will be running at `http://localhost:4000`!

## YAML File Format

Each YAML file contains an array of endpoint definitions:

```yaml
- method: GET           # HTTP method (GET, POST, PUT, DELETE, PATCH)
  path: /users/:id      # Route path (supports parameters)
  status: 200           # HTTP status code
  body:                 # Response body (can be any valid JSON)
    id: ":id"
    name: "Mock User"
    email: "user@example.com"
  delayMs: 150          # Optional delay in milliseconds
```

## Folder Structure and Routing

Files in nested folders become part of the URL path:

```
mock_server/
├── users.yaml              # Routes: /users/*
├── auth.yaml               # Routes: /auth/*
└── api/
    └── v1/
        └── products.yaml   # Routes: /api/v1/products/*
```

## Path Parameters and Templating

### Path Parameters

Use `:parameter` syntax in your paths:

```yaml
- method: GET
  path: /users/:id
  status: 200
  body:
    id: ":id"                    # Will be replaced with actual parameter
    name: "User :id"             # Dynamic interpolation
```

### Request Data Templating

Access request data in your responses:

```yaml
- method: POST
  path: /users
  status: 201
  body:
    name: "{{body.name}}"        # From request body
    email: "{{body.email}}"      # From request body
    id: "{{query.generateId}}"   # From query parameters
```

## CLI Commands

### Run Server

```bash
fake-end run [options]

Options:
  -p, --port <port>        Port to run the server on (default: 4000)
  -d, --dir <directory>    Directory containing mock YAML files (default: mock_server)
  -v, --verbose           Enable verbose logging
  --no-cache              Disable TypeScript interface caching for development
  --dynamic-mocks         Execute mock functions on each request instead of at startup
  -h, --help              Display help for command
```

### Generate Mocks

Generate TypeScript interface or YAML mock files from cURL commands:

```bash
fake-end generate [options]

Options:
  -c, --curl <curl>           cURL command to analyze and mock
  -f, --file <file>           File containing cURL command
  -o, --output <output>       Output directory for generated files (default: mock_server)
  --yaml                      Generate YAML files instead of TypeScript interfaces
  --execute                   Force execution of the cURL command to capture actual response
  --no-execute               Skip execution and infer response structure instead
  --ollama                    Use Ollama for AI-powered response generation
  --ollama-model <model>      Ollama model to use (default: qwen2.5-coder:0.5b)
  --ollama-host <host>        Ollama host URL (default: http://localhost:11434)
  -h, --help                  Display help for command
```

## Examples

### Basic User API

**mock_server/users.yaml:**
```yaml
- method: GET
  path: /users
  status: 200
  body:
    - id: "1"
      name: "John Doe"
      email: "john@example.com"
    - id: "2"
      name: "Jane Smith"
      email: "jane@example.com"

- method: GET
  path: /users/:id
  status: 200
  body:
    id: ":id"
    name: "User :id"
    email: "user:id@example.com"
  delayMs: 100

- method: POST
  path: /users
  status: 201
  body:
    id: "new-user-id"
    name: "{{body.name}}"
    email: "{{body.email}}"
    message: "User created successfully"
```

### Authentication API

**mock_server/auth.yaml:**
```yaml
- method: POST
  path: /auth/login
  status: 200
  body:
    token: "mock-jwt-token"
    user:
      id: "1"
      email: "{{body.email}}"
      name: "Mock User"
  delayMs: 200

- method: POST
  path: /auth/register
  status: 201
  body:
    message: "User registered successfully"
    user:
      id: "new-user-id"
      email: "{{body.email}}"
      name: "{{body.name}}"
```

### Nested API Structure

**mock_server/api/v1/products.yaml:**
```yaml
- method: GET
  path: /products
  status: 200
  body:
    data:
      - id: "1"
        name: "Product 1"
        price: 99.99
    pagination:
      page: 1
      total: 1

- method: GET
  path: /products/:id
  status: 200
  body:
    id: ":id"
    name: "Product :id"
    price: 49.99
```

This creates endpoints at:
- `GET /api/v1/products`
- `GET /api/v1/products/:id`

## Advanced Features

### Strict TypeScript Interface Generation

Generate accurate TypeScript interfaces with strict typing from cURL commands:

```bash
# Generate TypeScript interface with strict typing (default)
fake-end generate --curl "https://pokeapi.co/api/v2/pokemon/ditto"

# Generate YAML files instead
fake-end generate --curl "https://api.example.com/users/123" --yaml

# Force execution to capture real response structure
fake-end generate --curl "https://api.example.com/users" --execute

# Generate from cURL command with headers and data
fake-end generate --curl "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"

# Use AI to generate realistic responses (requires Ollama)
fake-end generate --curl "curl -X GET https://api.example.com/products" --ollama
```

**Generated TypeScript Interface Example:**
```typescript
// Generated from Pokemon API
interface ApiV2PokemonDittoResponse {
  abilities: { ability: { name: string; url: string }; is_hidden: boolean; slot: number }[];
  base_experience: number;
  sprites: { 
    front_default: string; 
    back_default: string;
    other: { 
      "dream_world": { front_default: string };
      "official-artwork": { front_default: string }
    };
    versions: {
      "generation-i": {
        "red-blue": { front_default: string; back_default: string }
      }
    }
  };
  // ... all properties with accurate, nested typing
}
```

### TypeScript Interface Integration

Fake-End can automatically generate realistic mock data from TypeScript interface definitions:

```typescript
// types/User.ts
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
}
```

```yaml
# mock_server/users.yaml
- method: GET
  path: /users/:id
  status: 200
  interfacePath: "./types/User.ts#User"  # Points to TypeScript interface
  body: {} # Will be auto-generated from interface
```

The server will automatically generate realistic data matching your TypeScript interface:
```json
{
  "id": "a7b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "age": 28,
  "isActive": true,
  "createdAt": "2024-03-15T10:30:00.000Z"
}
```

### Custom Mock Values with @mock Directives

Use `@mock` directives in TypeScript interfaces for custom static and dynamic values:

#### Static Mock Values
```typescript
interface Product {
  /** @mock 12345 */
  id: number;
  
  /** @mock "Custom Product Name" */
  name: string;
  
  /** @mock true */
  inStock: boolean;
  
  /** @mock {"nested": "object", "value": 42} */
  metadata: object;
}
```

#### Dynamic Mock Functions
```typescript
interface DynamicProduct {
  /** @mock () => Date.now() */
  timestamp: number;
  
  /** @mock () => `user_${crypto.randomUUID()}` */
  userId: string;
  
  /** @mock () => Math.random() > 0.5 */
  isOnSale: boolean;
  
  /** @mock () => ['red', 'blue', 'green'][Math.floor(Math.random() * 3)] */
  color: string;
  
  /** @mock () => ({ lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 }) */
  coordinates: { lat: number; lng: number };
}
```

### Faker.js Integration

#### Automatic Faker.js for Common Properties
Fake-End automatically detects common property names and uses appropriate Faker.js functions:

```typescript
interface User {
  id: number;        // Auto-generates: faker.number.int()
  email: string;     // Auto-generates: faker.internet.email()
  firstName: string; // Auto-generates: faker.person.firstName()
  lastName: string;  // Auto-generates: faker.person.lastName()
  phone: string;     // Auto-generates: faker.phone.number()
  website: string;   // Auto-generates: faker.internet.url()
  avatar: string;    // Auto-generates: faker.image.avatar()
  // ... and many more
}
```

#### Custom Faker.js with @mock Directives
```typescript
interface ProductWithFaker {
  /** @mock faker.number.int({ min: 1000, max: 9999 }) */
  id: number;
  
  /** @mock faker.commerce.productName() */
  name: string;
  
  /** @mock faker.number.float({ min: 10, max: 500, fractionDigits: 2 }) */
  price: number;
  
  /** @mock faker.helpers.arrayElement(["electronics", "clothing", "books"]) */
  category: string;
  
  /** @mock faker.lorem.paragraph() */
  description: string;
  
  /** @mock faker.date.past().toISOString() */
  createdAt: string;
}
```

#### Faker.js in YAML Templates
```yaml
- method: GET
  path: /users
  status: 200
  body:
    users: "{{faker.helpers.multiple(faker.helpers.arrayElement([{id: faker.string.uuid(), name: faker.person.fullName(), email: faker.internet.email()}]), {count: 10})}}"
    pagination:
      total: 100
      page: 1
      limit: 10
```

### AI-Powered Response Generation

Use Ollama for intelligent response generation based on cURL commands:

```bash
# Install and start Ollama first
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2.5-coder:0.5b

# Generate intelligent mocks
fake-end generate --curl "curl -X GET https://api.example.com/analytics/dashboard" --ollama
```

The AI will analyze the endpoint and generate contextually appropriate mock responses.

### Guard Functions with Either Pattern

Use guard functions to add conditional logic and validation to your endpoints:

#### YAML Guard Configuration
```yaml
- method: POST
  path: /products
  status: 200
  guard:
    condition:
      field: "price"
      operator: "greater_than"
      value: 0
    left:  # When condition fails
      status: 400
      body:
        error: "Price must be greater than 0"
        code: "INVALID_PRICE"
    right: # When condition passes
      status: 201
      body:
        message: "Product created successfully"
        id: "{{body.id}}"
        name: "{{body.name}}"
        price: "{{body.price}}"
```

#### TypeScript Guard with @guard Directive
```typescript
/**
 * @guard {
 *   "condition": { "field": "email", "operator": "contains", "value": "@" },
 *   "left": { "status": 400, "body": { "error": "Invalid email format" } },
 *   "right": { "status": 201, "body": { "message": "User created", "id": "new-user-123" } }
 * }
 */
interface CreateUserResponse {
  message: string;
  id: string;
  email?: string;
}
```

#### Supported Guard Operators
- `equals` / `not_equals`
- `greater_than` / `less_than`
- `greater_than_or_equal` / `less_than_or_equal`
- `contains` / `not_contains`
- `starts_with` / `ends_with`
- `matches_regex`
- `is_null` / `is_not_null`
- `is_empty` / `is_not_empty`

#### Either Pattern in TypeScript
The Either pattern is built into the type system for error handling:

```typescript
import { Either, left, right, isLeft, isRight } from 'fake-end';

// Type-safe error handling
type APIResult<T> = Either<{ error: string }, T>;

interface UserResponse {
  result: APIResult<{ id: string; name: string }>;
}

// Usage example
const handleResponse = (response: APIResult<User>) => {
  if (isLeft(response)) {
    console.log('Error:', response.value.error);
  } else {
    console.log('Success:', response.value.name);
  }
};
```

### Contract Generation and API Design

Use generated TypeScript interfaces as API contracts for frontend/backend alignment:

#### 1. Generate Contracts from Existing APIs
```bash
# Generate TypeScript contracts from production API
fake-end generate --curl "https://api.production.com/users/123" --execute
fake-end generate --curl "https://api.production.com/products" --execute

# This creates strict TypeScript interfaces that match your actual API
```

#### 2. Share Contracts Between Teams
```typescript
// Generated interface can be shared between frontend and backend teams
export interface ApiV1UsersResponse {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// Frontend can import and use these types
import { ApiV1UsersResponse } from './contracts/users';
```

#### 3. Mock Development with Real Contracts
```bash
# Start mock server with contract-based interfaces
fake-end run --dir ./contracts

# Frontend developers get realistic mock data that matches production
```

### Dynamic Mock Functions vs Static Values

Control when mock functions execute using the `--dynamic-mocks` flag:

```bash
# Static execution (default) - functions run once at startup
fake-end run

# Dynamic execution - functions run on each request
fake-end run --dynamic-mocks
```

**Static Mode** (default):
- Mock functions execute once when server starts
- Same values returned for all requests
- Better performance, predictable responses

**Dynamic Mode**:
- Mock functions execute on every request
- Different values for each request
- Realistic behavior for testing dynamic data

## Development

**Fake-End is built with Bun by design** to leverage TypeScript-native performance and seamless `.ts` file execution. This architectural choice enables the tool to run TypeScript interfaces and mock functions directly without compilation overhead.

### Why Bun?

- **TypeScript-Native**: Execute `.ts` files directly without build steps
- **Performance**: Faster startup and execution compared to Node.js + transpilation
- **Modern Runtime**: Built-in support for modern JavaScript/TypeScript features
- **Simplified Workflow**: No need for complex build pipelines for TypeScript code

### Development Commands

```bash
# Install dependencies
bun install

# Development mode (runs TypeScript directly)
bun run dev

# Start development server
bun run dev run

# Build the project for distribution
bun run build

# Run tests (executes .ts test files natively)
bun test
bun test:unit        # Unit tests only
bun test:e2e         # End-to-end tests only

# Code quality
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix linting issues
bun run tsc          # TypeScript compilation check
bun run verify       # Full verification pipeline

# Run the built version
bun start
```

### TypeScript-First Architecture

The choice of Bun enables Fake-End to provide a TypeScript-first experience where:
- Mock interfaces are executed as TypeScript without compilation
- Dynamic functions in `@mock` directives run natively
- Hot reload works seamlessly with `.ts` files
- Development and production environments are identical

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
