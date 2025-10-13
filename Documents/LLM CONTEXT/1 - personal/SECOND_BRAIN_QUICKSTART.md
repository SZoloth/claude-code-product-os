# Second Brain - Quick Reference

## 🚀 Essential Commands

```bash
# Daily workflow
npm run catch-up           # Get 3-day activity summary
npm run daily-progress     # End-of-day progress capture
npm run new-project        # Create structured project

# Utility commands  
npm run recent-files       # Show files modified in last 7 days
npm run search-content     # Search all markdown files
npm run file-stats         # Get vault statistics
```

## 🧠 Thinking Partner Usage

Instead of the custom agent, use the general-purpose agent with this prompt pattern:

```
"Act as my thinking partner to explore [topic]. Mine my vault for connections, 
generate insights, and ask probing questions. DO NOT create outlines or drafts - 
only help me think through questions, insights, and connections."
```

## 📁 Project Structure

Every new project gets:
- `index.md` - Overview and status
- `working_log.md` - Thinking sessions  
- `research/` - Background info
- `chats/` - Conversation transcripts
- `daily_progress/` - Progress tracking
- `notes/` - Working notes

## 💡 Core Workflow

1. **Start of day**: `npm run catch-up`
2. **Thinking sessions**: Use thinking partner agent
3. **Project work**: Update `working_log.md` files
4. **End of day**: `npm run daily-progress`

## 🎯 Operating Principles

- **READING > WRITING** - Explore before creating
- **SESSION CONTINUITY** - Always capture progress
- **PROJECT HYGIENE** - Use templates and consistent naming

Your second brain prioritizes exploration and insight over content creation!