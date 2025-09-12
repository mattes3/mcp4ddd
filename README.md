# mcp4ddd
A monorepo containing an MCP server that generates code based on the Domain-Driven Design methodology, along with shared runtime utilities and a testbed for safe experimentation.

Matthias Bohlen wrote it so that students of his [Domain-Driven Design classes](https://mbohlen.de/domain-driven-design-cpsa-a/?utm_source=ddd-scaffolder) get a jumpstart with DDD.

## Core Purpose
This project provides an MCP (Model Context Protocol) server that scaffolds Domain-Driven Design (DDD) components including entities, value objects, repositories, and domain services. It uses Handlebars templates to generate TypeScript code with proper DDD patterns.

## Key Features
- Generate DDD entities (optionally as aggregate roots)
- Generate value objects
- Generate repository interfaces
- Generate domain services
- Automatic test file generation
- Zod schema validation for inputs

## Environment Variables

The MCP server supports several environment variables to customize its behavior:

- `BOUNDED_CONTEXTS_PARENT_FOLDER`: Configures the parent folder for generated bounded contexts (default: `packages/domainlogic`)
- `BASIC_TYPES_FROM`: Specifies the import path for basic types used in domain services (default: `@ddd-components/runtime`)
- `BASIC_ERROR_TYPES_FROM`: Specifies the import path for basic error types used in domain services (default: `@ddd-components/runtime`)
- `DYNAMODB_CONFIG_FROM`: Specifies the import path for DynamoDB configuration used in repository implementations (default: `@ddd-components/runtime`)

## Target Users
Developers implementing Domain-Driven Design in TypeScript projects who want to quickly scaffold DDD components with consistent patterns.
