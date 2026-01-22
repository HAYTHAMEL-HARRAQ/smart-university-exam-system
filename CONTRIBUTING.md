# 🤝 Contributing to Smart University Exam System

First off, thank you for considering contributing to the Smart University Exam System! It's people like you that make this project better for everyone.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them contribute
- Provide constructive feedback
- Focus on what's best for the community

## 🚀 How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. Check existing issues to avoid duplicates
2. Try to reproduce the issue consistently
3. Gather relevant information (browser, OS, steps to reproduce)

**Good Bug Reports Include:**
- Clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots or videos if applicable
- Environment details (browser, OS versions)

### Suggesting Enhancements

We welcome feature suggestions! Good enhancement proposals:
- Explain the problem clearly
- Describe the proposed solution
- Include use cases and benefits
- Consider implementation complexity

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature
4. Make your changes
5. Test thoroughly
6. Submit a pull request

#### Development Setup
```bash
git clone https://github.com/yourusername/smart-university-exam-system.git
cd smart-university-exam-system
pnpm install
# Follow setup instructions in SETUP.md
```

#### Pull Request Process
1. Ensure your code follows our style guide
2. Add tests for new functionality
3. Update documentation as needed
4. Verify all tests pass
5. Request review from maintainers

### Documentation Improvements

Help us improve documentation by:
- Fixing typos and grammar
- Clarifying confusing sections
- Adding examples and tutorials
- Translating to other languages

## 🛠️ Development Guidelines

### Coding Standards

**TypeScript:**
- Use strict typing wherever possible
- Follow existing code patterns
- Add JSDoc comments for complex functions
- Keep functions small and focused

**React Components:**
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines (a11y)
- Optimize performance with memoization when needed

**Backend Services:**
- Validate all inputs
- Handle errors gracefully
- Log important events
- Follow REST/RPC conventions

### Git Workflow

**Branch Naming:**
```
feature/new-authentication-flow
bugfix/camera-permission-issue
hotfix/security-patch
docs/update-api-documentation
```

**Commit Messages:**
Follow conventional commits format:
```
feat: add student dashboard
fix: resolve camera freezing issue
docs: update setup guide
test: add authentication tests
refactor: optimize database queries
```

### Testing Requirements

**Before submitting PR:**
- All existing tests must pass
- New features require unit tests
- UI changes need integration tests
- Run `pnpm test` locally

**Test Coverage:**
- Aim for >80% coverage for new code
- Test edge cases and error conditions
- Include both positive and negative tests

### Documentation Updates

When adding new features:
- Update README.md if major changes
- Add API documentation in docs/API.md
- Include usage examples
- Update setup guides if needed

## 🎯 Project Structure Guidelines

### File Organization
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Primitive components
│   └── business/        # Domain-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and services
├── contexts/            # React contexts
└── types/               # TypeScript definitions
```

### Naming Conventions
- **Components**: PascalCase (`StudentDashboard.tsx`)
- **Files**: kebab-case (`student-dashboard.tsx`)
- **Variables**: camelCase (`currentUser`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ATTEMPTS`)
- **Interfaces**: PascalCase with `I` prefix (`IUser`)

## 🔧 Environment Setup

### Required Tools
- Node.js 18+
- pnpm package manager
- MySQL 8.0+
- Git

### Recommended Extensions
- VS Code with ESLint and Prettier extensions
- React Developer Tools browser extension
- TypeScript language service

## 🧪 Testing Your Changes

### Running Tests
```bash
pnpm test              # Run all tests
pnpm test --watch      # Watch mode
pnpm test --coverage   # Coverage report
```

### Manual Testing
- Test in multiple browsers
- Verify responsive design
- Check accessibility with screen readers
- Test with various user roles

## 🚨 Security Considerations

When contributing, consider:
- Input validation and sanitization
- Proper error handling without exposing internals
- Secure storage of sensitive data
- CORS and authentication checks
- Rate limiting implementation

## ❓ Questions?

Feel free to:
- Open a discussion on GitHub
- Contact maintainers directly
- Join our community chat (if available)
- Check existing documentation first

## 🎉 Recognition

Contributors will be:
- Added to contributors list
- Mentioned in release notes
- Given credit for significant contributions
- Invited to collaborate on future features

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make education more accessible and secure! 🎓✨