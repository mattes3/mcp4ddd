# mcp4ddd

[![npm version](https://img.shields.io/npm/v/@ddd-components/runtime.svg)](https://npmjs.com/package/@ddd-components/runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/mattes3/mcp4ddd/workflows/Build%20&%20Release/badge.svg)](https://github.com/mattes3/mcp4ddd/actions)

A monorepo containing an MCP server **and an OpenClaw plugin** that generate code based on the Domain-Driven Design methodology, along with shared runtime utilities and a testbed for safe experimentation.

Matthias Bohlen wrote it so that students of his [Domain-Driven Design classes](https://mbohlen.de/domain-driven-design-cpsa-a/?utm_source=ddd-scaffolder) get a jumpstart with DDD.

## Core Purpose
This project provides an MCP (Model Context Protocol) server that scaffolds Domain-Driven Design (DDD) components including entities, value objects, repositories, and domain services. It uses Handlebars templates to generate TypeScript code with proper DDD patterns.

## Key Features
- Generate DDD entities (optionally as aggregate roots)
- Generate value objects
- Generate repository interfaces
- Generate domain services (with optional transaction-aware repository support)
- Generate DynamoDB repository implementations
- Generate PostgreSQL repository implementations
- Automatic test file generation
- Zod schema validation for inputs
- Available as both an **MCP server** (for Claude Desktop, Kilocode and compatible clients) and an **OpenClaw plugin**

## Installation

mcp4ddd ships in two forms: an **MCP server** and an **OpenClaw plugin**. Both expose the same DDD generation tools. Choose whichever fits your workflow.

The generated code depends on a very small runtime library that you will find in the NPM package `@ddd-components/runtime`.

### Installing the MCP Server
Download the latest release from [GitHub Releases](https://github.com/mattes3/mcp4ddd/releases) and take the file `mcp4ddd.js`. You need to have NodeJS installed on your machine to be able to run it.

### Installing the OpenClaw Plugin
Download `ddd-scaffolder.zip` from the [latest GitHub Release](https://github.com/mattes3/mcp4ddd/releases) and install it with:

```bash
openclaw plugin install ddd-scaffolder.zip
```

After installation the plugin is immediately available within OpenClaw. No separate Node.js process is required.

### Installing the Runtime Library and further dependencies

Add this to your own project where the generated code will run:

```bash
npm install  @ddd-components/runtime ts-results-es zod
```
| Dependency | What it does |
| ------- | -------- |
| [ts-results-es](https://ts-results-es.readthedocs.io/en/latest/) | A TypeScript implementation of Rust's Result and Option objects. Brings compile-time error checking and optional values to TypeScript. |
| [zod](https://zod.dev/) | TypeScript-first schema validation with static type inference |

## Usage

### OpenClaw Plugin
The OpenClaw plugin exposes the same DDD generation tools as the MCP server, directly within [OpenClaw](https://openclaw.dev).

#### Plugin Configuration

After installing `ddd-scaffolder.zip`, configure the plugin in OpenClaw's plugin settings. The following options are available (all optional — the defaults shown below are applied automatically):

| Setting | Default | Meaning |
|---------|---------|---------|
| `basicTypesFrom` | `@ddd-components/runtime` | Import path for basic domain types |
| `basicErrorTypesFrom` | `@ddd-components/runtime` | Import path for basic error types |
| `boundedContextsParentFolder` | `packages` | Parent folder for generated bounded contexts |
| `dynamoDBConfigurationFrom` | `@ddd-components/runtime` | Import path for DynamoDB configuration |

These settings correspond exactly to the environment variables used by the MCP server (see [Environment Variables](#environment-variables) below).

### MCP Server
The MCP server provides tools for generating DDD components. It can be integrated with MCP clients like Claude Desktop.

Configure your MCP client to use the server:
```json
{
    "mcpServers": {
        "ddd-scaffolder": {
            "command": "/bin/sh",
            "args": [
                "-c",
                "node ~/bin/mcp4ddd.js"
            ],
            "env": {
                "BASIC_TYPES_FROM": "@ddd-components/runtime",
                "BASIC_ERROR_TYPES_FROM": "@ddd-components/runtime",
                "DYNAMODB_CONFIG_FROM": "@ddd-components/runtime",
                "BOUNDED_CONTEXTS_PARENT_FOLDER": "packages"
            }
        }
    }
}
```

The AI assistant that you use with this MCP server will "see" that it can generate entities, value objects, services, and repositories. You can use the following environment variables to influence its behavior:

- The generated code will be written to subdirectories of `BOUNDED_CONTEXTS_PARENT_FOLDER`.
- The basic types that the generated code needs at runtime will be imported from `BASIC_TYPES_FROM`.
- The basic error types will be imported from `BASIC_ERROR_TYPES_FROM`.
- You can override these module names to fit your project environment.

### Runtime Library
The runtime library [@ddd-components/runtime](https://www.npmjs.com/package/@ddd-components/runtime?activeTab=readme) provides utilities for the generated DDD components:

```typescript
import type { Branded, SingleError, TechError, ValidationError } from '@ddd-components/runtime';

import { beginWith, singleError, techError, validationError } from '@ddd-components/runtime';

// Use in generated and in hand-written code
```

## API Reference

### MCP Tools
- `generateEntity`: Creates DDD entities with optional aggregate root
- `generateValueObject`: Generates immutable value objects
- `generateRepository`: Creates repository interfaces
- `generateDomainService`: Generates domain services with dependency injection and optional transaction-aware repository support
- `generateDynamoDBRepository`: Generates DynamoDB repository implementations using ElectroDB
- `generatePostgreSQLRepository`: Generates PostgreSQL repository implementations using Kysely

### Runtime Exports
- `BasicErrorTypes`: Error type definitions
- `BasicModelTypes`: Basic model utilities
- `WorkflowStart`: Workflow utilities

### Environment Variables

The MCP server supports several environment variables to customize its behavior:

| Variable Name | Default Value | Meaning |
|---------------|---------------|---------|
| `BOUNDED_CONTEXTS_PARENT_FOLDER` | `packages` | Configures the parent folder for generated bounded contexts |
| `BASIC_TYPES_FROM` | `@ddd-components/runtime` | Specifies the import path for basic types used in domain services |
| `BASIC_ERROR_TYPES_FROM` | `@ddd-components/runtime` | Specifies the import path for basic error types used in domain services |
| `DYNAMODB_CONFIG_FROM` | `@ddd-components/runtime` | Specifies the import path for DynamoDB configuration used in repository implementations |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.

## Target Users
Developers implementing Domain-Driven Design in TypeScript projects who want to quickly scaffold DDD components with consistent patterns.
