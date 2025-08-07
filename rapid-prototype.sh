#!/usr/bin/env bash

# Rapid Prototype Setup Script
# Creates production-ready project templates with one command
# Built for Claude Code and Cursor IDE integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to get project type by number
get_project_type() {
    case $1 in
        1) echo "react-web" ;;
        2) echo "ios-swiftui" ;;
        3) echo "python-backend" ;;
        4) echo "fullstack" ;;
        5) echo "langflow-ai" ;;
        *) echo "" ;;
    esac
}

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Rapid Prototype Generator    ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_dependencies() {
    print_info "Checking dependencies..."
    
    # Check if we're in the right location
    if [[ ! -d "prototype-templates" ]]; then
        print_error "prototype-templates directory not found!"
        print_info "Please run this script from the directory containing prototype-templates/"
        exit 1
    fi
    
    # Check for required tools
    local missing_tools=()
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
        missing_tools+=("npm or pnpm")
    fi
    
    if ! command -v python3 &> /dev/null; then
        missing_tools+=("python3")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        print_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        print_info "Please install the missing tools and try again."
        exit 1
    fi
    
    print_success "All dependencies found"
}

prompt_project_type() {
    echo ""
    print_info "Select project type:"
    echo "  1) React Web App (Next.js 15 + TypeScript + Tailwind)"
    echo "  2) iOS SwiftUI App (iOS 17+ + Testing)"
    echo "  3) Python Backend (FastAPI + SQLAlchemy + Testing)"
    echo "  4) Full-Stack App (React + FastAPI + Shared Types)"
    echo "  5) LangFlow AI App (LangChain + RAG + Vector DB)"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-5): " choice
        if [[ "$choice" =~ ^[1-5]$ ]]; then
            PROJECT_TYPE="$(get_project_type $choice)"
            break
        else
            print_error "Invalid choice. Please enter 1, 2, 3, 4, or 5."
        fi
    done
    
    print_success "Selected: $PROJECT_TYPE"
}

prompt_project_details() {
    echo ""
    print_info "Project configuration:"
    
    # Project name
    while true; do
        read -p "Project name (lowercase, no spaces): " PROJECT_NAME
        if [[ "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]] && [[ ${#PROJECT_NAME} -ge 2 ]]; then
            break
        else
            print_error "Invalid project name. Use lowercase letters, numbers, and hyphens only (min 2 chars)."
        fi
    done
    
    # Display name
    read -p "Display name (for UI): " DISPLAY_NAME
    if [[ -z "$DISPLAY_NAME" ]]; then
        DISPLAY_NAME="$PROJECT_NAME"
    fi
    
    # Author name
    read -p "Author name: " AUTHOR_NAME
    if [[ -z "$AUTHOR_NAME" ]]; then
        AUTHOR_NAME="Your Name"
    fi
    
    # Author email
    read -p "Author email: " AUTHOR_EMAIL
    if [[ -z "$AUTHOR_EMAIL" ]]; then
        AUTHOR_EMAIL="your.email@example.com"
    fi
    
    # For iOS projects, get bundle ID
    if [[ "$PROJECT_TYPE" == "ios-swiftui" ]]; then
        read -p "Bundle identifier (com.yourcompany.appname): " BUNDLE_ID
        if [[ -z "$BUNDLE_ID" ]]; then
            BUNDLE_ID="com.example.${PROJECT_NAME}"
        fi
        
        read -p "Development team ID (optional): " TEAM_ID
        if [[ -z "$TEAM_ID" ]]; then
            TEAM_ID="YOUR_TEAM_ID"
        fi
    fi
    
    # API URL for frontend projects
    if [[ "$PROJECT_TYPE" == "react-web" ]] || [[ "$PROJECT_TYPE" == "fullstack" ]]; then
        read -p "API base URL (default: http://localhost:8000): " API_URL
        if [[ -z "$API_URL" ]]; then
            API_URL="http://localhost:8000"
        fi
    fi
    
    # GitHub repository (optional)
    read -p "GitHub repository URL (optional): " GITHUB_REPO
    
    print_success "Configuration complete"
}

create_project() {
    print_info "Creating project: $PROJECT_NAME"
    
    # Check if directory already exists
    if [[ -d "$PROJECT_NAME" ]]; then
        print_error "Directory '$PROJECT_NAME' already exists!"
        read -p "Overwrite? (y/N): " overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            print_info "Aborted by user"
            exit 1
        fi
        rm -rf "$PROJECT_NAME"
    fi
    
    # Copy template
    local template_dir="prototype-templates/${PROJECT_TYPE}-template"
    if [[ ! -d "$template_dir" ]]; then
        print_error "Template directory not found: $template_dir"
        exit 1
    fi
    
    print_info "Copying template files..."
    cp -r "$template_dir" "$PROJECT_NAME"
    print_success "Files copied"
    
    # Replace placeholders
    print_info "Configuring project..."
    replace_placeholders
    print_success "Project configured"
}

replace_placeholders() {
    local project_dir="$PROJECT_NAME"
    
    # Find all files that might contain placeholders (excluding binary files and node_modules)
    local files_to_process
    files_to_process=$(find "$project_dir" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/build/*" \
        -not -path "*/dist/*" \
        -not -path "*/.next/*" \
        -not -path "*/coverage/*" \
        -not -name "*.png" \
        -not -name "*.jpg" \
        -not -name "*.jpeg" \
        -not -name "*.gif" \
        -not -name "*.ico" \
        -not -name "*.dmg" \
        -not -name "*.zip")
    
    # Replace placeholders in files
    for file in $files_to_process; do
        if [[ -f "$file" ]]; then
            # Use temporary file to avoid issues with in-place editing
            local temp_file=$(mktemp)
            
            # Basic replacements
            sed "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s/PROJECT_DISPLAY_NAME_PLACEHOLDER/$DISPLAY_NAME/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s/PROJECT_AUTHOR_PLACEHOLDER/$AUTHOR_NAME/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s/PROJECT_EMAIL_PLACEHOLDER/$AUTHOR_EMAIL/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            
            # iOS-specific replacements
            if [[ "$PROJECT_TYPE" == "ios-swiftui" ]]; then
                sed "s/ProjectNamePlaceholder/$PROJECT_NAME/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
                sed "s/BUNDLE_ID_PLACEHOLDER/$BUNDLE_ID/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
                sed "s/TEAM_ID_PLACEHOLDER/$TEAM_ID/g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            fi
            
            # API URL replacements
            if [[ -n "$API_URL" ]]; then
                sed "s|PROJECT_API_BASE_URL_PLACEHOLDER|$API_URL|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            fi
            
            # GitHub repository
            if [[ -n "$GITHUB_REPO" ]]; then
                sed "s|PROJECT_GITHUB_PLACEHOLDER|$GITHUB_REPO|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
                sed "s|PROJECT_REPO_URL_PLACEHOLDER|$GITHUB_REPO|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            fi
            
            # Default URLs (fallbacks)
            sed "s|PROJECT_PRIVACY_URL_PLACEHOLDER|https://example.com/privacy|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s|PROJECT_TERMS_URL_PLACEHOLDER|https://example.com/terms|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s|PROJECT_SUPPORT_URL_PLACEHOLDER|https://example.com/support|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s|PROJECT_DOCS_URL_PLACEHOLDER|https://example.com/docs|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            sed "s|PROJECT_ISSUES_URL_PLACEHOLDER|https://example.com/issues|g" "$file" > "$temp_file" && mv "$temp_file" "$file"
            
            # Clean up any remaining temp files
            [[ -f "$temp_file" ]] && rm -f "$temp_file"
        fi
    done
    
    # Rename iOS-specific directories and files
    if [[ "$PROJECT_TYPE" == "ios-swiftui" ]]; then
        cd "$project_dir"
        
        # Rename .xcodeproj
        if [[ -d "ProjectNamePlaceholder.xcodeproj" ]]; then
            mv "ProjectNamePlaceholder.xcodeproj" "${PROJECT_NAME}.xcodeproj"
        fi
        
        # Rename main app directory
        if [[ -d "ProjectNamePlaceholder" ]]; then
            mv "ProjectNamePlaceholder" "$PROJECT_NAME"
        fi
        
        # Rename test directories
        if [[ -d "ProjectNamePlaceholderTests" ]]; then
            mv "ProjectNamePlaceholderTests" "${PROJECT_NAME}Tests"
        fi
        
        if [[ -d "ProjectNamePlaceholderUITests" ]]; then
            mv "ProjectNamePlaceholderUITests" "${PROJECT_NAME}UITests"
        fi
        
        cd ..
    fi
}

setup_git() {
    print_info "Initializing git repository..."
    
    cd "$PROJECT_NAME"
    
    # Initialize git
    git init
    git add .
    git commit -m "Initial commit - Created from rapid-prototype template

- Project: $DISPLAY_NAME
- Type: $PROJECT_TYPE
- Author: $AUTHOR_NAME
- Generated: $(date)

🤖 Generated with Rapid Prototype Template System"
    
    # Add remote if provided
    if [[ -n "$GITHUB_REPO" ]]; then
        git remote add origin "$GITHUB_REPO"
        print_success "Git remote added: $GITHUB_REPO"
    fi
    
    cd ..
    print_success "Git repository initialized"
}

install_dependencies() {
    print_info "Installing dependencies..."
    
    cd "$PROJECT_NAME"
    
    case "$PROJECT_TYPE" in
        "react-web"|"fullstack")
            if [[ "$PROJECT_TYPE" == "fullstack" ]]; then
                # Install frontend dependencies
                if [[ -d "frontend" ]]; then
                    cd frontend
                    if command -v pnpm &> /dev/null; then
                        pnpm install
                    else
                        npm install
                    fi
                    cd ..
                fi
                
                # Install backend dependencies
                if [[ -d "backend" ]]; then
                    cd backend
                    python3 -m venv venv
                    source venv/bin/activate
                    pip install -e ".[dev]"
                    cd ..
                fi
            else
                # React web project
                if command -v pnpm &> /dev/null; then
                    pnpm install
                else
                    npm install
                fi
            fi
            ;;
        "python-backend"|"langflow-ai")
            python3 -m venv venv
            source venv/bin/activate
            pip install -e ".[dev]"
            ;;
        "ios-swiftui")
            print_info "iOS project created - open ${PROJECT_NAME}.xcodeproj in Xcode"
            ;;
    esac
    
    cd ..
    print_success "Dependencies installed"
}

copy_ai_workflow() {
    print_info "Adding AI development workflow..."
    
    if [ -d "ai-dev-workflow" ]; then
        # Copy the workflow files to project
        mkdir -p "$PROJECT_NAME/ai-dev-workflow"
        cp -r ai-dev-workflow/* "$PROJECT_NAME/ai-dev-workflow/"
        
        # Create tasks directory
        mkdir -p "$PROJECT_NAME/tasks"
        
        # Add credit in the project
        cat > "$PROJECT_NAME/ai-dev-workflow/README.md" << EOF
# AI Development Workflow

This workflow is provided by [snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks).

**Credit**: snarktank for creating this structured approach to AI-assisted feature development.

## Usage

1. **create-prd.md** - Generate Product Requirements Documents
2. **generate-tasks.md** - Break PRDs into implementation tasks  
3. **process-task-list.md** - Execute tasks step-by-step with AI

See the original repository for full documentation and updates.
EOF
        
        print_success "AI workflow added - use for structured feature development"
        print_info "Credit: snarktank/ai-dev-tasks for the workflow"
    else
        print_info "AI workflow not available (submodule not initialized)"
    fi
}

create_claude_md() {
    print_info "Creating CLAUDE.md configuration..."
    
    local claude_file="$PROJECT_NAME/CLAUDE.md"
    
    case "$PROJECT_TYPE" in
        "react-web")
            cat > "$claude_file" << EOF
# $DISPLAY_NAME - React Web Application

This is a modern React web application built with Next.js 15, TypeScript, and Tailwind CSS.

## Development Commands

\`\`\`bash
npm run dev              # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run lint            # Check code style
npm run type-check      # TypeScript checking
\`\`\`

## Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI for accessible components
- **State Management**: React Query for server state, Zustand for client state
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Optimized for Vercel

## Project Structure

- \`src/app/\` - Next.js app directory with pages and layouts
- \`src/components/\` - React components (ui/, layout/, features/)
- \`src/lib/\` - Utility functions and configurations
- \`src/hooks/\` - Custom React hooks
- \`src/types/\` - TypeScript type definitions

## Guidelines for Claude

- Always use TypeScript with proper typing
- Follow the existing component patterns in \`src/components/ui/\`
- Use Tailwind CSS classes, avoid custom CSS unless necessary
- Implement proper error boundaries and loading states
- Write tests for new components and functions
- Use the existing utility functions from \`src/lib/utils.ts\`
EOF
            ;;
        "ios-swiftui")
            cat > "$claude_file" << EOF
# $DISPLAY_NAME - iOS SwiftUI Application

This is a modern iOS application built with SwiftUI targeting iOS 17+.

## Development

Open \`${PROJECT_NAME}.xcodeproj\` in Xcode to start development.

## Architecture

- **Framework**: SwiftUI with UIKit bridges where needed
- **Language**: Swift 5.9+
- **Architecture**: MVVM with @StateObject and @Published
- **Networking**: Async/await with Combine for reactive programming
- **Testing**: XCTest for unit tests, XCUITest for UI tests
- **Deployment**: iOS 17+ targeting iPhone and iPad

## Project Structure

- \`Models/\` - Data models and business logic
- \`ViewModels/\` - MVVM view models with @ObservableObject
- \`Services/\` - API clients and business services
- \`Extensions/\` - Swift extensions and utilities
- \`Utilities/\` - Helper functions and constants

## Guidelines for Claude

- Use SwiftUI best practices and declarative patterns
- Implement proper state management with @StateObject/@ObservableObject
- Follow iOS Human Interface Guidelines
- Use async/await for network calls
- Implement proper error handling and loading states
- Write unit tests for view models and services
- Use the existing NetworkManager for API calls
EOF
            ;;
        "python-backend")
            cat > "$claude_file" << EOF
# $DISPLAY_NAME - FastAPI Backend

This is a modern FastAPI backend application with async support and production-ready features.

## Development Commands

\`\`\`bash
# Activate virtual environment
source venv/bin/activate

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest
pytest --cov=app

# Code quality
black .
isort .
flake8 .
mypy .

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
\`\`\`

## Architecture

- **Framework**: FastAPI with async/await
- **Database**: SQLAlchemy 2.0 with async support
- **Migration**: Alembic for database migrations
- **Testing**: Pytest with async support
- **Logging**: Structured logging with structlog
- **API Docs**: Automatic OpenAPI/Swagger generation

## Project Structure

- \`app/api/\` - API endpoints organized by version
- \`app/core/\` - Core functionality (config, database, etc.)
- \`app/models/\` - SQLAlchemy models
- \`app/services/\` - Business logic services
- \`app/utils/\` - Utility functions
- \`tests/\` - Test files

## Guidelines for Claude

- Use async/await throughout the application
- Follow FastAPI best practices and dependency injection
- Use Pydantic models for request/response validation
- Implement proper error handling with custom exceptions
- Write comprehensive tests for all endpoints
- Use the existing database session pattern
- Follow the existing logging patterns with structlog
EOF
            ;;
        "langflow-ai")
            cat > "$claude_file" << EOF
# $DISPLAY_NAME - LangFlow AI Application

This is a LangFlow AI application with FastAPI backend, designed for building AI agents, RAG systems, and document processing workflows.

\`\`\`bash
# Activate virtual environment
source venv/bin/activate

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest
pytest --cov=app

# Code quality
black .
isort .
flake8 .
mypy .

# Process documents for RAG
curl -X POST "http://localhost:8000/api/v1/flows/upload-documents" \\
  -H "Content-Type: application/json" \\
  -d '{"files": ["./documents/your-document.pdf"]}'

# Execute AI flows
curl -X POST "http://localhost:8000/api/v1/flows/execute" \\
  -H "Content-Type: application/json" \\
  -d '{"flow_id": "chat-basic", "inputs": {"message": "Hello"}}'
\`\`\`

## Architecture

- **Framework**: FastAPI with LangFlow and LangChain integration
- **AI Components**: LangChain for LLM orchestration, ChromaDB for vector storage
- **Document Processing**: PDF, DOCX, TXT, and Markdown support
- **Vector Database**: ChromaDB for semantic search and retrieval
- **LLM Support**: OpenAI, Anthropic, and other providers
- **API Design**: RESTful endpoints for flow execution and document management

## Available Flows

- **chat-basic**: Simple conversational AI using OpenAI GPT
- **rag-qa**: Retrieval-Augmented Generation for document Q&A  
- **document-summary**: AI-powered document summarization

## Project Structure

- \`app/api/v1/flows.py\` - LangFlow API endpoints
- \`app/services/langflow_service.py\` - Core LangFlow logic
- \`flows/\` - Flow configuration files (JSON)
- \`documents/\` - Document storage for RAG applications
- \`vector_store/\` - ChromaDB vector database storage

## Environment Setup

Essential environment variables in \`.env\`:

\`\`\`bash
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Optional
LANGFLOW_URL=http://localhost:7860
CHROMA_PERSIST_DIRECTORY=./vector_store
\`\`\`

## Guidelines for Claude

- Use the LangFlow service for all AI operations
- Follow the existing flow patterns when adding new workflows
- Implement proper error handling for LLM API calls
- Use async/await throughout the application
- Store documents properly for RAG applications
- Test all flows thoroughly with different inputs
- Use structured logging for AI operations monitoring
- Follow the existing API patterns for consistency
EOF
            ;;
        "fullstack")
            cat > "$claude_file" << EOF
# $DISPLAY_NAME - Full Stack Application

This is a full-stack application with React frontend and FastAPI backend, sharing TypeScript types for end-to-end type safety.

## Development Commands

\`\`\`bash
# Start everything with Docker
docker-compose up -d

# Frontend development (in frontend/ directory)
npm run dev
npm run test
npm run build

# Backend development (in backend/ directory)
source venv/bin/activate
uvicorn app.main:app --reload
pytest
alembic upgrade head
\`\`\`

## Architecture

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Shared**: TypeScript types for API contracts
- **Database**: PostgreSQL with Redis for caching
- **Deployment**: Docker containers for all services

## Project Structure

- \`frontend/\` - React/Next.js application
- \`backend/\` - FastAPI Python application  
- \`shared/\` - Shared TypeScript types and schemas
- \`docker-compose.yml\` - Development environment

## Guidelines for Claude

- Maintain type safety between frontend and backend using shared types
- Update \`shared/types/api.ts\` when changing API contracts
- Use the existing API client pattern in frontend
- Follow FastAPI best practices in backend
- Write tests for both frontend and backend components
- Use Docker Compose for local development
- Keep database migrations in backend/migrations/
EOF
            ;;
    esac
    
    print_success "CLAUDE.md created"
}

print_completion() {
    echo ""
    print_success "🎉 Project created successfully!"
    echo ""
    print_info "Project: $DISPLAY_NAME"
    print_info "Location: ./$PROJECT_NAME"
    print_info "Type: $PROJECT_TYPE"
    echo ""
    
    case "$PROJECT_TYPE" in
        "react-web")
            print_info "Next steps:"
            echo "  1. cd $PROJECT_NAME"
            echo "  2. npm run dev"
            echo "  3. Open http://localhost:3000"
            echo "  4. Start coding in Cursor!"
            ;;
        "ios-swiftui")
            print_info "Next steps:"
            echo "  1. cd $PROJECT_NAME"
            echo "  2. open ${PROJECT_NAME}.xcodeproj"
            echo "  3. Build and run in Xcode"
            echo "  4. Start coding!"
            ;;
        "python-backend")
            print_info "Next steps:"
            echo "  1. cd $PROJECT_NAME"
            echo "  2. source venv/bin/activate"
            echo "  3. uvicorn app.main:app --reload"
            echo "  4. Open http://localhost:8000/docs"
            echo "  5. Start coding!"
            ;;
        "langflow-ai")
            print_info "Next steps:"
            echo "  1. cd $PROJECT_NAME"
            echo "  2. cp .env.example .env (add your OpenAI API key)"
            echo "  3. source venv/bin/activate"
            echo "  4. uvicorn app.main:app --reload"
            echo "  5. Open http://localhost:8000/docs"
            echo "  6. Try the AI flows and start building!"
            ;;
        "fullstack")
            print_info "Next steps:"
            echo "  1. cd $PROJECT_NAME"
            echo "  2. docker-compose up -d"
            echo "  3. Frontend: http://localhost:3000"
            echo "  4. Backend: http://localhost:8000/docs"
            echo "  5. Start coding!"
            ;;
    esac
    
    echo ""
    print_info "CLAUDE.md has been created with project-specific guidance for AI assistance."
    print_warning "Remember to update environment variables in .env files before deploying!"
    echo ""
}

main() {
    print_header
    
    check_dependencies
    prompt_project_type
    prompt_project_details
    
    echo ""
    print_info "Summary:"
    echo "  Project: $DISPLAY_NAME ($PROJECT_NAME)"
    echo "  Type: $PROJECT_TYPE"
    echo "  Author: $AUTHOR_NAME <$AUTHOR_EMAIL>"
    [[ "$PROJECT_TYPE" == "ios-swiftui" ]] && echo "  Bundle ID: $BUNDLE_ID"
    [[ -n "$API_URL" ]] && echo "  API URL: $API_URL"
    [[ -n "$GITHUB_REPO" ]] && echo "  Repository: $GITHUB_REPO"
    echo ""
    
    read -p "Create project? (Y/n): " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        print_info "Aborted by user"
        exit 0
    fi
    
    create_project
    setup_git
    install_dependencies
    copy_ai_workflow
    create_claude_md
    print_completion
}

# Run main function
main "$@"