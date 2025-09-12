# Slash Commands Directory

This directory contains workflow-based slash commands that can be invoked on-demand in Claude Code.

## Available Commands

### Project Management (`/project/`)
- **`/plan-project`** - Creates structured project plans with Linear integration
- **`/write-jira-ticket`** - Creates outcome-focused JIRA tickets from research

### Research & Analysis (`/research/`)
- **`/fact-check`** - Rigorous fact-checking and source verification

### Design Verification (`/design/`)
- **`/verify-implementation`** - Verifies UI implementations against Figma designs

### Communication (`/communication/`)
- **`/optimize-document`** - Transforms verbose documents using BLUF/Minto frameworks

### Documentation (`/docs/`)
- **`/manage-documentation`** - Organizes and maintains project documentation

### Meta Commands (`/meta/`)
- **`/create-subagent`** - Creates specialized subagents for custom needs

## Usage

Invoke any command by typing `/command-name` in your Claude Code chat. Each command includes flexible parameters and structured outputs.

## Principles

These commands follow Cline workflow principles:
- **On-demand execution**: Only consume tokens when invoked
- **Procedural structure**: Clear Phase 1, 2, 3... sequences
- **Tool integration**: Leverage Claude Code's built-in tools
- **Quality outputs**: Generate multiple structured deliverables