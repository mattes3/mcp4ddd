# Technologies

## Technologies Used

### Core Technologies
- **TypeScript**: Primary programming language for both source code and generated output
- **Node.js**: Runtime environment (configured for Node 22 via @tsconfig/node22)
- **MCP SDK**: Model Context Protocol implementation for server-client communication
- **Handlebars**: Templating engine for code generation
- **Zod**: Schema validation library for input/output validation

### Development Tools
- **pnpm**: Package manager with workspace support
- **esbuild**: Fast bundler for compiling TypeScript to JavaScript
- **tsx**: TypeScript execution environment for testing
- **Vitest**: Testing framework (with node:test compatibility)
- **Prettier**: Code formatting tool

### Configuration
- **TypeScript Project References**: Separate compilation for source and test code
- **ESLint/Prettier**: Code quality and formatting standards
- **Git**: Version control with standard .gitignore patterns

## Development Setup

### Project Structure
```
mcp4ddd/
├── packages/
│   ├── scaffolder/     # @ddd-components/scaffolder
│   │   ├── src/        # MCP server source files
│   │   ├── test/       # Unit tests
│   │   ├── types/      # Type definitions
│   │   └── dist/       # Compiled output
│   ├── runtime/        # @ddd-components/runtime
│   │   ├── src/        # Shared utilities
│   │   └── dist/       # Compiled output
│   └── testbed/        # @ddd-components/testbed
│       ├── src/        # Test application
│       ├── prompts/    # Example prompts
│       └── dist/       # Compiled output
├── package.json        # Root workspace config
├── pnpm-workspace.yaml # Workspace configuration
└── tsconfig.*.json     # TypeScript configurations
```

### Build Process
1. TypeScript compilation using project references
2. Bundling with esbuild to create single executable
3. Output: `dist/mcp4ddd.js` (ESM format)

### Testing Setup
- Uses `node:test` for test execution
- Custom loader for Handlebars template files
- Watch mode support for development

## Technical Constraints

### Language Requirements
- Must generate valid TypeScript code
- Source code written in TypeScript with strict settings
- ES modules throughout the project

### Protocol Constraints
- MCP server must use stdio transport
- Input/output schemas must be Zod-compatible
- Server must handle JSON serialization/deserialization

### Template Constraints
- Handlebars templates must produce syntactically correct TypeScript
- Template variables must match Zod schema definitions
- File paths must follow DDD conventions

## Dependencies

### Runtime Dependencies
- `@modelcontextprotocol/sdk`: MCP server implementation
- `handlebars`: Template rendering
- `zod`: Schema validation

### Development Dependencies
- `@tsconfig/node22`: Node.js 22 TypeScript configuration
- `@tsconfig/strictest`: Strict TypeScript settings
- `@types/node`: Node.js type definitions
- `esbuild`: Bundling tool
- `expect`: Assertion library for tests
- `prettier`: Code formatter
- `tsx`: TypeScript runner
- `typescript`: TypeScript compiler
- `vitest`: Test framework

## Tool Usage Patterns

### Package Management
- `pnpm install`: Install dependencies for all packages
- `pnpm -r build`: Compile and bundle all packages
- `pnpm dev`: Build and run the MCP server
- `pnpm test`: Run test suite for the scaffolder package
- `pnpm test:watch`: Run tests in watch mode for the scaffolder package
- `pnpm --filter @ddd-components/scaffolder <command>`: Run command for specific package
- `pnpm --filter @ddd-components/testbed dev`: Run testbed in development mode

### MCP Tool Failure Handling
- If `use_mcp_tool` or `access_mcp_resource` calls fail or do not return expected results, immediately report the failure to the user.
- Do not attempt manual generation, simulation, or workarounds based on reading source code.
- Wait for user guidance on how to proceed, such as fixing the MCP server configuration or using alternative tools.

### Development Workflow
1. Make changes to source files or templates
2. Run `pnpm build` to compile
3. Run `pnpm test` to verify functionality
4. Use `pnpm dev` for interactive development

### Code Quality
- Prettier formatting applied automatically
- TypeScript strict mode enforced
- Zod schemas ensure runtime type safety
- Comprehensive test coverage required