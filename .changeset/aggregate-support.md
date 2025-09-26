---
"@ddd-components/scaffolder": minor
---

feat(scaffolder)!: add aggregate support to domain service generation

- Added aggregateName parameter to generateDomainService input schema
- Updated domainService.hbs template to conditionally generate transaction-based services
- Improved error messages to include aggregate IDs
- Fixed return type handling to prevent AsyncResult nesting
