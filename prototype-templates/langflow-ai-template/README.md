# PROJECT_NAME_PLACEHOLDER - LangFlow AI Application

A production-ready LangFlow AI application with FastAPI backend for building AI agents, RAG systems, and document processing workflows.

## ✨ Features

### 🤖 AI-Powered
- **LangFlow Integration** - Visual flow builder for AI applications
- **LangChain Support** - Comprehensive LLM framework integration
- **Multi-LLM Support** - OpenAI, Anthropic, and other providers
- **Vector Database** - ChromaDB for document embeddings and retrieval

### 🚀 Production Ready
- **FastAPI Backend** - High-performance async API server
- **Type Safety** - Full TypeScript-style type hints with Pydantic
- **Testing Suite** - Comprehensive test coverage with pytest
- **Docker Support** - Containerized deployment
- **CI/CD Pipeline** - GitHub Actions workflow included

### 📄 Document Processing
- **Multi-format Support** - PDF, DOCX, TXT, Markdown files
- **Smart Chunking** - Intelligent document splitting
- **RAG Workflows** - Ready-to-use retrieval-augmented generation
- **Vector Search** - Semantic document search capabilities

### 🛡️ Enterprise Features
- **Authentication** - JWT-based secure access
- **Rate Limiting** - Built-in API rate limiting
- **Monitoring** - Prometheus metrics and structured logging
- **Error Handling** - Comprehensive error tracking with Sentry

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- OpenAI API key (for LLM access)
- Optional: Anthropic API key

### Installation

1. **Install Dependencies**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   
   # Install packages
   pip install -e ".[dev]"
   ```

2. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your API keys
   OPENAI_API_KEY=your-openai-api-key-here
   ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Optional
   ```

3. **Start the Server**
   ```bash
   # Development server
   uvicorn app.main:app --reload
   
   # Production server
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

4. **Access the Application**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health
   - Metrics: http://localhost:8000/metrics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional |
| `LANGFLOW_URL` | LangFlow server URL | http://localhost:7860 |
| `CHROMA_PERSIST_DIRECTORY` | Vector DB storage | ./vector_store |
| `DOCUMENTS_PATH` | Document storage | ./documents |
| `DEFAULT_LLM_MODEL` | Default LLM model | gpt-3.5-turbo |
| `CHUNK_SIZE` | Document chunk size | 1000 |
| `CHUNK_OVERLAP` | Chunk overlap | 200 |

### Supported File Types
- **PDF** - Portable Document Format
- **DOCX** - Microsoft Word documents  
- **TXT** - Plain text files
- **MD** - Markdown documents

## 🎯 API Endpoints

### Flow Management
- `GET /api/v1/flows/` - List available flows
- `GET /api/v1/flows/{flow_id}` - Get flow configuration
- `POST /api/v1/flows/execute` - Execute a flow
- `GET /api/v1/flows/executions/{execution_id}` - Get execution status

### Document Processing
- `POST /api/v1/flows/upload-documents` - Process documents for RAG
- `DELETE /api/v1/flows/documents/{document_id}` - Delete processed document

### Authentication & Health
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/health` - Health check
- `GET /metrics` - Prometheus metrics

## 🏗️ Architecture

```
project/
├── app/
│   ├── api/v1/
│   │   ├── flows.py          # LangFlow API endpoints
│   │   ├── auth.py           # Authentication endpoints
│   │   └── health.py         # Health check endpoints
│   ├── services/
│   │   └── langflow_service.py # Core LangFlow logic
│   ├── core/
│   │   ├── config.py         # Application configuration
│   │   ├── database.py       # Database connection
│   │   └── logging.py        # Structured logging
│   └── main.py               # FastAPI application
├── flows/
│   ├── chat-basic.json       # Basic chat flow
│   └── rag-qa.json          # RAG Q&A flow
├── documents/               # Document storage
├── vector_store/           # ChromaDB vector database
└── tests/                  # Test suite
```

## 🤖 Available Flows

### 1. Basic Chat (`chat-basic`)
Simple conversational AI using OpenAI GPT models.

**Usage:**
```bash
curl -X POST "http://localhost:8000/api/v1/flows/execute" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flow_id": "chat-basic",
    "inputs": {"message": "Hello, how are you?"}
  }'
```

### 2. RAG Q&A (`rag-qa`)
Retrieval-Augmented Generation for document-based questions.

**Usage:**
```bash
# First, upload documents
curl -X POST "http://localhost:8000/api/v1/flows/upload-documents" \\
  -H "Content-Type: application/json" \\
  -d '{"files": ["./documents/your-document.pdf"]}'

# Then ask questions
curl -X POST "http://localhost:8000/api/v1/flows/execute" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flow_id": "rag-qa", 
    "inputs": {"question": "What is this document about?"}
  }'
```

### 3. Document Summary (`document-summary`)
Summarize uploaded documents using AI.

**Usage:**
```bash
curl -X POST "http://localhost:8000/api/v1/flows/execute" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flow_id": "document-summary",
    "inputs": {"document": "Your document text here..."}
  }'
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m slow          # Long-running tests
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t PROJECT_NAME_PLACEHOLDER .

# Run container
docker run -d \\
  --name PROJECT_NAME_PLACEHOLDER \\
  -p 8000:8000 \\
  -e OPENAI_API_KEY=your-key \\
  PROJECT_NAME_PLACEHOLDER

# Docker Compose (recommended)
docker-compose up -d
```

## 🔍 Development

### Code Quality
```bash
# Format code
black .
isort .

# Lint code  
flake8 .
mypy app

# Type checking
mypy app --strict

# Pre-commit hooks
pre-commit install
pre-commit run --all-files
```

### Adding New Flows

1. **Create Flow JSON** in `flows/` directory
2. **Update Service** in `app/services/langflow_service.py`
3. **Add Tests** in `tests/test_flows.py`
4. **Update Documentation**

Example flow structure:
```json
{
  "id": "my-flow",
  "name": "My Custom Flow", 
  "description": "Description of what this flow does",
  "components": [...],
  "connections": [...]
}
```

## 📊 Monitoring

### Metrics Available
- **Request metrics** - Count, duration, status codes
- **Flow execution** - Success/failure rates, processing time
- **Document processing** - Upload counts, processing time
- **Vector database** - Query performance, storage usage

### Structured Logging
All logs include:
- Request ID for tracing
- User context
- Performance metrics  
- Error details with stack traces

## 🚀 Production Deployment

### Environment Setup
```bash
# Production environment
export ENVIRONMENT=production
export SECRET_KEY=your-production-secret-key
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://...
```

### Security Checklist
- [ ] Set strong `SECRET_KEY`
- [ ] Configure HTTPS/TLS
- [ ] Set up rate limiting
- [ ] Enable authentication
- [ ] Configure CORS properly
- [ ] Set up monitoring/alerting

### Scaling
- Use gunicorn with multiple workers
- Deploy behind reverse proxy (nginx)
- Use Redis for caching and sessions
- Set up database connection pooling
- Consider container orchestration (Kubernetes)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` endpoint for API documentation
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas

## 🎉 What's Next?

This template gives you a production-ready foundation. Consider adding:

- **Custom LLM providers** (local models, other APIs)
- **Advanced RAG techniques** (hybrid search, reranking)
- **Multi-modal support** (images, audio processing)
- **Workflow orchestration** (complex multi-step processes)
- **Real-time chat** (WebSocket support)
- **User management** (registration, profiles, permissions)

---

**Built with ❤️ for the AI community. Happy building!** 🚀