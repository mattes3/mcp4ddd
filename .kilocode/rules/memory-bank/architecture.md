# Architecture

## System Architecture

mcp4ddd is implemented as a monorepo with three packages:

1. **@ddd-components/scaffolder**: MCP server **and OpenClaw plugin** that generates DDD components
2. **@ddd-components/runtime**: Shared runtime library with utilities
3. **@ddd-components/testbed**: Safe experimentation environment

The scaffolder ships in two delivery formats:
- **MCP server** – runs as a local Node.js process and communicates with MCP clients (e.g. Claude Desktop) via standard input/output streams.
- **OpenClaw plugin** – packaged as `ddd-scaffolder.zip`, installed with `openclaw plugin install ddd-scaffolder.zip`, and registered directly inside OpenClaw via `OpenClawPlugin.ts`.

Both formats expose the same six generation tools and share the same generator functions and Handlebars templates.

## Source Code Paths

### Scaffolder Package (`packages/scaffolder/`)
- `src/index.ts` - Main MCP server entry point and tool registration
- `src/OpenClawPlugin.ts` - OpenClaw plugin entry point; wraps all generators as OpenClaw agent tools
- `src/ScaffolderConfig.ts` - Shared configuration schema (used by both MCP env vars and OpenClaw plugin settings)
- `src/McpTool.ts` - Shared tool interface bridging MCP and OpenClaw
- `src/generate*.ts` - Individual generator implementations (entity, valueObject, repository, domainService, dynamoDBRepository, postgreSQLRepository)
- `src/generateOpenClawJSON.ts` - Generates OpenClaw plugin descriptor JSON
- `src/templates/` - Handlebars templates for code generation
- `src/FieldSchema.ts` - Shared Zod schema for field definitions
- `openclaw/openclaw-build.sh` - Packages the OpenClaw plugin bundle into `ddd-scaffolder.zip`
- `openclaw/package-bundled.json` - `package.json` for the bundled OpenClaw plugin
- `test/` - Unit tests for generators and OpenClaw plugin
- `tsconfig.json` - Main TypeScript configuration with project references
- `tsconfig.src.json` - Source files TypeScript configuration
- `tsconfig.test.json` - Test files TypeScript configuration
- `dist/mcp4ddd.js` - Compiled MCP server output (generated)
- `dist/openclaw/ddd-scaffolder.zip` - Compiled OpenClaw plugin output (generated)

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

### OpenClaw Plugin
- Implemented in `OpenClawPlugin.ts` using the `openclaw/plugin-sdk`
- Wraps each generator's `McpTool` as an `AnyAgentTool` via `wrapAsOpenClawAgentTool()`
- Converts Zod schemas to JSON Schema using `zod-to-json-schema` for the OpenClaw parameter UI
- Configuration is provided via `ScaffolderConfig` (same four settings as MCP env vars, but surfaced through OpenClaw's plugin config UI)
- Packaged into `ddd-scaffolder.zip` by `openclaw-build.sh`

### Code Generation
- Handlebars templating engine for flexible code generation
- Zod schemas for input validation and type safety
- TypeScript as target language for generated code

### Project Structure
- Separate source and test configurations using TypeScript project references
- Modular generator functions for maintainability
- Template-based approach for consistency

## Design Patterns (quite opinionated!)

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

### "Parse, don't Validate" Pattern in the generated DDD code

Entitites, value objects, and the parameter object of a service only work with already validated data. None of the functions inside a DDD element validates any data but they assume that the `parseXYZServiceParameters()` method that is generated for each service has already done the job. We `parse` raw parameters into valid parameters before entering the business logic. We do not `validate` inside the business logic itself!

### Error handling pattern in the generated DDD code

The business logic of a service does not use try/catch for error handling. Instead, it uses the `AsyncResult` type (from the NPM library ts-results-es). This type can contain a valid result like `Ok(5)` or an error object like `Err(createXYZServiceError('not found'))`. This way, the business logic code that the user or assistant writes manually, must look like this:

```ts
const result = await beginWith(serviceParameterObject)
    .andThen(
        someRepository.get({id: serviceParameterObject.interestingId })
            .toResult(createXYZServiceError('interesting object not found'))
    )
    .andThen(doSomethingThatReturnsAResultOrAsyncResult)
    .andThen(...possibly more workflow steps...);

if (result.isErr()) { /* ...handle the error ...*/ }

// ... No error, now use `result.value`
```

## Component Relationships

```
MCP Client <-> MCP Server (@ddd-components/scaffolder)
    |
    +-> generateEntity
    +-> generateValueObject
    +-> generateRepository
    +-> generateDomainService
    +-> generateDynamoDBRepository
    +-> generatePostgreSQLRepository
        |
        +-> Zod Schemas (validation)
        +-> Handlebars Templates (code generation)
        +-> File Output (TypeScript + Tests)
            |
            +-> @ddd-components/runtime (shared utilities)

OpenClaw <-> OpenClaw Plugin (@ddd-components/scaffolder / OpenClawPlugin.ts)
    |
    +-> same six generators (wrapped as AnyAgentTool)
        |
        +-> same Zod Schemas + Handlebars Templates
        +-> same File Output
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
5. Structured output for MCP client or OpenClaw plugin

### MCP Server Startup
1. Initialize MCP server with name and version
2. Register all six generation tools
3. Set up stdio transport
4. Connect and listen for client requests

### OpenClaw Plugin Registration
1. `OpenClawPlugin.ts` default export is the plugin descriptor
2. On `register(api)`, each generator factory is called with `api.pluginConfig` as `ScaffolderConfig`
3. Each resulting `McpTool` is wrapped via `wrapAsOpenClawAgentTool()` and registered with `api.registerTool()`
4. OpenClaw calls `tool.execute(toolCallId, params, signal, onUpdate)` when the user invokes a tool

## Data Flow

```
MCP Client Request  -> MCP Server      -> Tool Execution -> Template Rendering -> File Generation -> MCP Response
OpenClaw Tool Call  -> OpenClaw Plugin -> Tool Execution -> Template Rendering -> File Generation -> OpenClaw Response
```

## Error Handling

- Zod validation ensures input correctness
- Template compilation errors are caught and handled
- Server fatal errors logged to stderr before exit

## Extensibility

The architecture supports adding new generators by:
1. Creating new generator function following the template pattern
2. Adding Handlebars templates
3. Registering the tool with the MCP server (`src/index.ts`) **and** the OpenClaw plugin (`src/OpenClawPlugin.ts`)
4. Adding corresponding tests