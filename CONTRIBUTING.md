# Contributing to mcp4ddd

Thank you for your interest in contributing to mcp4ddd! We welcome contributions from the community.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mattes3/mcp4ddd.git
   cd mcp4ddd
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Making Changes

0. Fork the repo [on GitHub](https://github.com/mattes3/mcp4ddd/fork) and clone the fork to your local disk.

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and add tests.

3. Run the test suite:
   ```bash
   pnpm test
   ```

4. Create a changeset for your changes:
   ```bash
   pnpm changeset
   ```

5. Commit your changes and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request.

## Code Style

- Use TypeScript with strict settings
- Follow the existing code patterns
- Add tests for new functionality
- Update documentation as needed

## Release Process

Releases are managed through changesets. When your PR is merged, the maintainers will handle versioning and publishing.

A maintainer will need to do the following after merging the pull requests:

```bash
pnpm version-packages
git add .
git commit -m "Released vX.Y.Z"
git push origin main
```

## Questions?

Feel free to open an issue for questions or discussions.
