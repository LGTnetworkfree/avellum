# Contributing to Avellum

Thank you for your interest in contributing to Avellum! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something together.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/LGTnetworkfree/avellum/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS/Node version

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would benefit the project

### Submitting Code

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following our coding standards
5. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
6. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add new feature description"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** against `main`

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define explicit types (avoid `any`)

### Code Style

- Use ESLint configuration provided
- Run `npm run lint:fix` before committing
- Use meaningful variable/function names
- Keep functions small and focused

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for meaningful test coverage

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if needed
- Add tests for new functionality
- Ensure CI checks pass
- Request review from maintainers

## Project Structure

```
avellum/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── lib/           # Utilities and helpers
├── hooks/         # Custom React hooks
├── anchor/        # Solana smart contract
├── __tests__/     # Test files
└── supabase/      # Database migrations
```

## Getting Help

- Check the [documentation](https://avellum.xyz/docs)
- Ask questions in [Issues](https://github.com/LGTnetworkfree/avellum/issues)
- Reach out on [Twitter](https://x.com/Avellumxyz)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
