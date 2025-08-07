# PROJECT_NAME_PLACEHOLDER - Full Stack Application

A modern full-stack application combining React frontend with FastAPI backend, sharing TypeScript types for end-to-end type safety.

## 🏗️ Architecture

```
PROJECT_NAME_PLACEHOLDER/
├── frontend/              # Next.js + React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/               # FastAPI Python backend  
│   ├── app/
│   ├── tests/
│   ├── pyproject.toml
│   └── ...
├── shared/                # Shared types and utilities
│   ├── types/            # TypeScript type definitions
│   └── schemas/          # API schemas
└── docker-compose.yml    # Development environment
```

## 🚀 Quick Start

1. **Clone and setup:**
   ```bash
   # This will be automated by the rapid-prototype.sh script
   ```

2. **Start development environment:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (recommended)

### Manual Setup

1. **Backend setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -e ".[dev]"
   cp .env.example .env
   uvicorn app.main:app --reload
   ```

2. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

### Shared Types

The `shared/` directory contains TypeScript type definitions that are used by both frontend and backend:

- **API Types**: Request/response interfaces
- **Data Models**: User, Product, etc.
- **Validation Schemas**: Shared validation logic

### API Integration

The frontend uses a type-safe API client that automatically matches the backend API:

```typescript
// Frontend API client with full type safety
import { ApiClient } from '@/lib/api-client'

const api = new ApiClient('http://localhost:8000')

// TypeScript knows the exact shape of the response
const user = await api.users.getMe()
```

### Database & Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "Add new table"

# Run migrations
alembic upgrade head
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e  # Playwright tests
```

### Full Stack Integration Tests
```bash
# Start all services
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

## 🚢 Deployment

### Development (Docker Compose)
```bash
docker-compose up -d
```

### Production

1. **Build images:**
   ```bash
   docker build -t PROJECT_NAME_PLACEHOLDER-frontend ./frontend
   docker build -t PROJECT_NAME_PLACEHOLDER-backend ./backend
   ```

2. **Deploy to your platform:**
   - **Frontend**: Vercel, Netlify, or any static hosting
   - **Backend**: Railway, Render, or any container platform
   - **Database**: PostgreSQL (Railway, Supabase, etc.)

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=PROJECT_NAME_PLACEHOLDER
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=your-secret-key
```

## 📊 Features

### Frontend (Next.js + React)
- Server-side rendering (SSR)
- Static site generation (SSG)
- Type-safe API integration
- Modern UI with Tailwind CSS
- Comprehensive testing setup

### Backend (FastAPI + Python)
- Async/await throughout
- Automatic API documentation
- Database migrations with Alembic
- Background tasks with Celery
- Comprehensive test coverage

### Shared
- End-to-end type safety
- Shared validation schemas
- API contract testing
- Consistent data models

## 🔧 Configuration

The application supports multiple environments:

- **Development**: Hot reloading, debug mode
- **Testing**: Isolated test databases
- **Production**: Optimized builds, monitoring

## 📈 Monitoring

- **Frontend**: Vercel Analytics, Sentry
- **Backend**: Prometheus metrics, structured logging
- **Database**: Connection pooling, query monitoring

## 🤝 Contributing

1. Make changes to frontend/backend
2. Update shared types if needed
3. Add tests for new features
4. Run full test suite
5. Submit pull request

---

Built with ❤️ using the Rapid Prototype Template System