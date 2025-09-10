# Project Brief

## Project Name
mcp4ddd

## Version
1.0.0

## Description
An MCP server that generates code based on the Domain-Driven Design methodology.

## Author
Matthias Bohlen

## License
MIT

## Core Purpose
This project provides an MCP (Model Context Protocol) server that scaffolds Domain-Driven Design (DDD) components including entities, value objects, repositories, and domain services. It uses Handlebars templates to generate TypeScript code with proper DDD patterns.

## Key Features
- Generate DDD entities (optionally as aggregate roots)
- Generate value objects
- Generate repository interfaces
- Generate domain services
- Automatic test file generation
- Zod schema validation for inputs

## Target Users
Developers implementing Domain-Driven Design in TypeScript projects who want to quickly scaffold DDD components with consistent patterns.

## Success Criteria
- Successfully generates valid TypeScript code following DDD principles
- Integrates seamlessly with MCP clients
- Provides comprehensive test coverage
- Maintains high code quality and type safety

## Constraints
- Must use TypeScript for generated code
- Follows strict DDD patterns
- Uses Handlebars for templating
- Requires MCP SDK for server functionality

## Future Enhancements
- Understand the notion of a `bounded context`
- Generate code for a project that spans multiple bounded contexts
- Generate zod validation code for service parameters
- Generate repository implementations for DynamoDB

## Notes
- Currently, there is no additional context or important information here.
