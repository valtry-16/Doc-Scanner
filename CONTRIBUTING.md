# Contributing to Document Processing Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to this open-source project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Redis server
- Tesseract OCR
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Compressor-Convertor.git
cd Compressor-Convertor

# Set up frontend
cd frontend
npm install
npm run dev

# Set up backend (in a new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Start Celery worker (in another terminal)
cd backend
source venv/bin/activate
celery -A workers.celery_app worker --loglevel=info

# Start Redis (in another terminal)
redis-server
```

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # Reusable React components
│   ├── services/     # API service layer
│   ├── hooks/        # Custom React hooks
│   └── utils/        # Utility functions

backend/
├── api/              # FastAPI route handlers
├── workers/          # Celery background workers
├── core/             # Core business logic
└── utils/            # Utility functions
```

## Code Style

### Frontend (TypeScript/React)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful component and variable names

### Backend (Python)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions and classes
- Keep functions small and focused
- Use meaningful variable names
- Handle errors gracefully

## Testing

### Frontend

```bash
cd frontend
npm run test
npm run lint
```

### Backend

```bash
cd backend
pytest
black . --check
flake8
```

## Pull Request Process

1. **Create a branch** - Use a descriptive name (e.g., `feature/pdf-rotation`, `fix/upload-validation`)

2. **Write clear commits** - Use conventional commit messages:
   - `feat: add PDF rotation feature`
   - `fix: resolve upload validation bug`
   - `docs: update API documentation`
   - `refactor: simplify image compression logic`
   - `test: add tests for merge functionality`

3. **Update documentation** - If you add features, update the README and relevant docs

4. **Test thoroughly** - Ensure all tests pass and the feature works as expected

5. **Submit PR** - Provide a clear description of what your PR does

6. **Respond to feedback** - Address review comments promptly

## Feature Requests

Before implementing a new feature:

1. Check existing issues to see if it's already planned
2. Open an issue to discuss the feature
3. Wait for approval before starting work
4. Reference the issue in your PR

## Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)

## What to Contribute

### Good First Issues

- UI improvements
- Documentation updates
- Bug fixes
- Unit tests
- Error message improvements

### Wanted Features

- Additional file format support
- Performance optimizations
- Better error handling
- Accessibility improvements
- Internationalization (i18n)

### Areas Needing Help

- [ ] PDF splitting functionality
- [ ] PDF reordering interface
- [ ] Custom compression quality settings
- [ ] Batch file processing
- [ ] Progress indicators for large files
- [ ] Better mobile responsiveness

## Code Review

All contributions require code review before merging. Reviewers will check:

- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Ask in pull request comments
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
