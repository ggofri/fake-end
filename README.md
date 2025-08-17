# Fake-End

A modern TypeScript CLI tool for mocking backend APIs using YAML files. Perfect for frontend developers who need to simulate backend APIs during development.

## Features

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

## Installation

```bash
npm install -g fake-end
```

Or use it directly with npx:

```bash
npx fake-end run
```

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

Generate YAML mock files from cURL commands:

```bash
fake-end generate [options]

Options:
  -c, --curl <curl>           cURL command to analyze and mock
  -f, --file <file>           File containing cURL command
  -o, --output <output>       Output directory for generated YAML files (default: mock_server)
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

### Mock Generation from cURL Commands

Generate YAML mock files directly from cURL commands:

```bash
# Generate from a cURL command directly
fake-end generate --curl "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"John\",\"email\":\"john@example.com\"}'"

# Generate from a file containing cURL command
echo "curl -X GET https://api.example.com/users/123" > curl-command.txt
fake-end generate --file curl-command.txt

# Force execution to capture real response
fake-end generate --curl "curl -X GET https://api.example.com/users" --execute

# Use AI to generate realistic responses (requires Ollama)
fake-end generate --curl "curl -X GET https://api.example.com/products" --ollama
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

### Realistic Mock Data with Faker.js

Fake-End includes Faker.js integration for generating realistic mock data:

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

## Development

This project uses Bun as the runtime and package manager:

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Start development server
bun run dev run

# Build the project
bun run build

# Run tests
bun test
bun test:unit        # Unit tests only
bun test:e2e         # End-to-end tests only

# Code quality
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix linting issues
bun run tsc          # TypeScript compilation
bun run verify       # Full verification pipeline

# Run the built version
bun start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
