# Architecture

## System Architecture

mcp4ddd is implemented as an MCP (Model Context Protocol) server that runs as a local process and communicates with MCP clients via standard input/output streams. The server exposes four generation tools that create Domain-Driven Design components using templated code generation.

## Source Code Paths

- `src/index.ts` - Main server entry point and tool registration
- `src/generate*.ts` - Individual generator implementations (entity, valueObject, repository, domainService)
- `src/templates/` - Handlebars templates for code generation
- `src/FieldSchema.ts` - Shared Zod schema for field definitions
- `test/` - Unit tests for generators
- `dist/index.js` - Compiled output (generated)

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
MCP Client <-> MCP Server (ddd-scaffolder)
    |
    +-> generateEntity
    +-> generateValueObject
    +-> generateRepository
    +-> generateDomainService
        |
        +-> Zod Schemas (validation)
        +-> Handlebars Templates (code generation)
        +-> File Output (TypeScript + Tests)
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