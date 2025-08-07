# PROJECT_NAME_PLACEHOLDER

A modern FastAPI backend application with best practices, built for production use.

## 🚀 Features

- **FastAPI** with async/await support
- **SQLAlchemy 2.0** with async support
- **Alembic** for database migrations
- **Pydantic V2** for data validation
- **PostgreSQL** and **SQLite** support
- **Redis** for caching and sessions
- **JWT** authentication
- **Docker** ready with multi-stage builds
- **Pytest** with async support
- **Structured logging** with structlog
- **Prometheus** metrics
- **OpenAPI** documentation
- **Pre-commit** hooks for code quality
- **GitHub Actions** CI/CD

## 📋 Requirements

- Python 3.11+
- PostgreSQL (for production) or SQLite (for development)
- Redis (optional, for caching)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PROJECT_NAME_PLACEHOLDER
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at http://localhost:8000

## 📁 Project Structure

```
app/
├── api/                    # API endpoints
│   └── v1/                # API version 1
│       ├── auth.py        # Authentication endpoints
│       ├── users.py       # User endpoints
│       └── health.py      # Health check endpoints
├── core/                  # Core functionality
│   ├── config.py          # Configuration management
│   ├── database.py        # Database setup
│   ├── logging.py         # Logging configuration
│   └── middleware.py      # Custom middleware
├── models/                # SQLAlchemy models
├── services/              # Business logic
├── utils/                 # Utility functions
└── main.py               # FastAPI application factory
```

## 🚀 Development

### Running the application
```bash
# Development with auto-reload
uvicorn app.main:app --reload

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Database operations
```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Run migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_main.py
```

### Code quality
```bash
# Format code
black .
isort .

# Lint
flake8 .
mypy .

# Run all quality checks
pre-commit run --all-files
```

## 🐳 Docker

### Build and run with Docker
```bash
# Build image
docker build -t PROJECT_NAME_PLACEHOLDER .

# Run container
docker run -p 8000:8000 PROJECT_NAME_PLACEHOLDER
```

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 API Documentation

When running in development mode, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## 🔧 Configuration

The application uses environment variables for configuration. See `.env.example` for all available options.

### Key Environment Variables

```bash
# Basic settings
PROJECT_NAME=PROJECT_NAME_PLACEHOLDER
ENVIRONMENT=development
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
# or for SQLite:
DATABASE_URL=sqlite+aiosqlite:///./app.db

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

## 🧪 Testing

The project includes comprehensive tests:

- **Unit tests** for services and utilities
- **Integration tests** for API endpoints
- **Database tests** with test database
- **Performance tests** for critical paths

```bash
# Run tests with different markers
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m "not slow"        # Skip slow tests
```

## 🚀 Deployment

### Environment Setup

1. **Production environment variables**
2. **Database setup** (PostgreSQL recommended)
3. **Redis setup** (for caching and sessions)
4. **Reverse proxy** (Nginx recommended)

### Using Railway/Render/Heroku

The app is ready for deployment on modern platforms:

1. Set environment variables
2. The app will automatically run database migrations
3. Health checks are available at `/health`

### Using Docker in production

```dockerfile
# Multi-stage build for smaller image size
docker build -t PROJECT_NAME_PLACEHOLDER .
docker run -p 8000:8000 --env-file .env PROJECT_NAME_PLACEHOLDER
```

## 📈 Monitoring

- **Health checks** at `/health` and `/health/detailed`
- **Prometheus metrics** at `/metrics`
- **Structured logging** in JSON format
- **Sentry integration** for error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Create a pull request

### Development workflow

```bash
# Install pre-commit hooks
pre-commit install

# Make changes and commit
git add .
git commit -m "Add new feature"  # This runs pre-commit hooks

# Push changes
git push origin feature-branch
```

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ using the Rapid Prototype Template System