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
├── src/                 # Source TypeScript files
├── test/               # Test files
├── dist/               # Compiled output (generated)
├── src/templates/      # Handlebars templates
├── types/              # Type definitions
└── tsconfig.*.json     # TypeScript configurations
```

### Build Process
1. TypeScript compilation using project references
2. Bundling with esbuild to create single executable
3. Output: `dist/index.js` (ESM format)

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
- `pnpm install`: Install dependencies
- `pnpm build`: Compile and bundle the project
- `pnpm dev`: Build and run in development mode
- `pnpm test`: Run test suite
- `pnpm test:watch`: Run tests in watch mode

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