# Architecture

## System Architecture

mcp4ddd is implemented as a monorepo with three packages:

1. **@ddd-components/scaffolder**: MCP server that generates DDD components
2. **@ddd-components/runtime**: Shared runtime library with utilities
3. **@ddd-components/testbed**: Safe experimentation environment

The MCP server runs as a local process and communicates with MCP clients via standard input/output streams. The server exposes four generation tools that create Domain-Driven Design components using templated code generation.

## Source Code Paths

### Scaffolder Package (`packages/scaffolder/`)
- `src/index.ts` - Main server entry point and tool registration
- `src/generate*.ts` - Individual generator implementations (entity, valueObject, repository, domainService)
- `src/templates/` - Handlebars templates for code generation
- `src/FieldSchema.ts` - Shared Zod schema for field definitions
- `test/` - Unit tests for generators
- `tsconfig.json` - Main TypeScript configuration with project references
- `tsconfig.src.json` - Source files TypeScript configuration
- `tsconfig.test.json` - Test files TypeScript configuration
- `dist/index.js` - Compiled output (generated)

### Runtime Package (`packages/runtime/`)
- `src/BasicErrorTypes.ts` - Error type definitions
- `src/BasicModelTypes.ts` - Basic model type utilities
- `src/DynamoDBConfig.ts` - DynamoDB configuration
- `src/WorkflowStart.ts` - Workflow utilities
- `src/index.ts` - Main exports
- `dist/` - Compiled output

### Testbed Package (`packages/testbed/`)
- `src/index.ts` - Test application entry point
- `prompts/` - Example prompt files for testing
- `dist/` - Compiled output

## Key Technical Decisions

### MCP Protocol
- Uses MCP SDK for server implementation
- StdioServerTransport for client communication
- Structured input/output schemas for type safety

### Code Generation
- Handlebars templating engine for flexible code generation
- Zod schemas for input validation and type safety
- TypeScript as target language for generated code

### Project Structure
- Separate source and test configurations using TypeScript project references
- Modular generator functions for maintainability
- Template-based approach for consistency

## Design Patterns

### Template Method Pattern
Each generator follows the same structure:
1. Define Zod input/output schemas
2. Process input parameters
3. Compile Handlebars templates
4. Return structured file generation data

### Factory Pattern
Generated code includes factory functions for creating DDD components (e.g., `createEntity`)

### Repository Pattern
Generated repository interfaces follow DDD repository patterns with optional CRUD methods

## Component Relationships

```
MCP Client <-> MCP Server (@ddd-components/scaffolder)
    |
    +-> generateEntity
    +-> generateValueObject
    +-> generateRepository
    +-> generateDomainService
        |
        +-> Zod Schemas (validation)
        +-> Handlebars Templates (code generation)
        +-> File Output (TypeScript + Tests)
            |
            +-> @ddd-components/runtime (shared utilities)
```

```
@ddd-components/testbed
    |
    +-> Safe experimentation environment
    +-> Example prompts for testing
    +-> Imports from @ddd-components/runtime
```

## Critical Implementation Paths

### Entity Generation Flow
1. Input validation via Zod schema
2. Template compilation with Handlebars
3. File path generation (`src/domain/{entity}/{entity}.ts`)
4. Test file generation (`test/{entity}/{entity}.spec.ts`)
5. Structured output for MCP client

### Server Startup
1. Initialize MCP server with name and version
2. Register all four generation tools
3. Set up stdio transport
4. Connect and listen for client requests

## Data Flow

```
Client Request -> MCP Server -> Tool Execution -> Template Rendering -> File Generation -> Client Response
```

## Error Handling

- Zod validation ensures input correctness
- Template compilation errors are caught and handled
- Server fatal errors logged to stderr before exit

## Extensibility

The architecture supports adding new generators by:
1. Creating new generator function following the template pattern
2. Adding Handlebars templates
3. Registering the tool with the MCP server
4. Adding corresponding tests