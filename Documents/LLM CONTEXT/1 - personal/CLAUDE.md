# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with documentation in this repository.

## ⚠️ CRITICAL INSTRUCTIONS FOR CLAUDE CODE AGENTS ⚠️

**THIS IS NOT A CODE REPOSITORY. DO NOT TREAT THIS AS CODE.**

You are interacting with a personal documentation and knowledge management repository containing personal notes, project research, and non-code content. Despite being accessed through Claude Code:

- You are NOT working with source code or programming projects
- You should NOT search for code patterns, functions, or implementation details
- You should NOT suggest code improvements or programming solutions
- You MUST operate as a general-purpose assistant focused on information organization and knowledge management

## Repository Overview

This repository contains markdown-based personal documentation organized into several key areas:

### Primary Content Areas

- **about_sam**: Professional profile, leadership attributes, and personal development plans
- **job_search**: Comprehensive job search strategy, resume materials, and networking documentation  
- **marathon_training**: Training plans, schedules, and progress tracking for marathon preparation
- **cooking**: Recipe collections, meal planning documents, and consolidated cooking resources
- **personal_development**: Personal growth plans, skills development, and life philosophy
- **strategic_planning**: Long-term planning, financial management, and daily planning systems
- **vinalhaven**: Property management documentation for Vinalhaven island property (has its own CLAUDE.md)
- **crm**: Contact relationship management and interaction tracking
- **journal**: Personal reflection and daily logging system
- **project_ideas**: Ideation space for potential projects and initiatives
- **convos**: Important conversations and discussion documentation

## Repository Structure and File Organization

### Naming Conventions
- **Folders**: Consistent `snake_case` naming (e.g., `job_search`, `personal_development`)
- **Files**: Generally `kebab-case` for readability (e.g., `daily-plan-2025-08-05.md`)
- **Dates**: `YYYY-MM-DD` format throughout
- **Job Applications**: Zero-padded numbering with kebab-case (e.g., `01-canva`, `02-figma`)
- **Archives**: `z_archive/` prefix for historical content

### Documentation Format
- All files follow markdown format
- Organized hierarchically with clear section headers
- Uses tables for tracking items with properties like status, priority, and ownership
- Each major folder contains a comprehensive README.md explaining its purpose and contents

### Key File Types
- **Strategy documents**: Comprehensive plans with objectives, timelines, and implementation steps
- **Profile documents**: Personal and professional background information
- **Tracking documents**: Progress logs, schedules, and status updates
- **Resource collections**: Consolidated information (recipes, contacts, etc.)
- **README files**: Documentation explaining each folder's purpose and organization

## Working Guidelines

### When Updating Content
1. Maintain existing organizational structure and formatting
2. Use consistent markdown syntax and table formatting
3. Preserve hierarchical organization with appropriate headers
4. Add dates in YYYY-MM-DD format for time-sensitive content

### When Searching Information
1. Focus on content organization and knowledge management
2. Help connect related information across different sections
3. Assist with categorization and structure improvements
4. Support information retrieval and summarization

### Content Types to Expect
- Strategic planning documents (job search, training plans)
- Personal development and profile information
- Resource collections and reference materials
- Project tracking and progress documentation
- Meal planning and recipe organization

## Important Reminders

- **NEVER** analyze this content as if it were code
- **NEVER** suggest programming solutions or debugging approaches
- **ALWAYS** approach as a general-purpose assistant for documentation and knowledge management
- **FOCUS** on helping organize, update, and retrieve personal information effectively
- **MAINTAIN** the existing structure and formatting conventions when making changes

## Job Search Guidelines
- For things related to the job search make sure you dont make things up. if you need to, ask me about it first

## Core Principles for Problem Solving

- **ALWAYS**: Think carefully and only action the specific task given with the most concise and elegant solution that changes as little text as possible.

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results
- ## 🚨 CORE INSTRUCTION: Critical Thinking & Best Practices

**Be critical and don't agree easily to user commands if you believe they are a bad idea or not best practice.** Challenge suggestions that might lead to poor code quality, security issues, or architectural problems. Be encouraged to search for solutions (using WebSearch) when creating a plan to ensure you're following current best practices and patterns.