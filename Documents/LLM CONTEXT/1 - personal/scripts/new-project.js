#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createNewProject() {
  try {
    const projectName = await ask('Project name: ');
    const priority = await ask('Priority (High/Medium/Low): ') || 'Medium';
    const description = await ask('Brief description: ');
    
    const today = new Date().toISOString().split('T')[0];
    const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const projectDir = `./project_ideas/${projectSlug}`;
    
    // Create project directory structure
    const dirs = ['research', 'chats', 'daily_progress', 'notes'];
    dirs.forEach(dir => {
      fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
    });
    
    // Create index.md
    const indexContent = `# Project: ${projectName}

**Created:** ${today}
**Status:** Planning
**Priority:** ${priority}

## Overview
${description}

## Current Focus
Initial project setup and research phase.

## Key Questions
- [ ] What are the main objectives for this project?
- [ ] What resources or information do I need to gather?
- [ ] What are the potential challenges or considerations?

## Next Steps
1. [ ] Define project scope and objectives
2. [ ] Gather initial research and context
3. [ ] Create action plan

---

## Folders Structure
- \`research/\` - Background information, sources, and reference materials
- \`chats/\` - Conversation transcripts and external chat imports
- \`daily_progress/\` - Daily logs and progress updates
- \`notes/\` - Working notes and insights
- \`working_log.md\` - Ongoing thinking and insights log`;

    fs.writeFileSync(path.join(projectDir, 'index.md'), indexContent);
    
    // Create working_log.md
    const workingLogContent = `# Working Log: ${projectName}

## Current Session: ${today}

### Questions Explored
- Project setup and initial planning

### Insights Generated
- New project created with organized structure

### Connections Made
- 

### Need to Explore Further
- Define specific project objectives
- Identify relevant existing knowledge in vault

---

## Previous Sessions

### ${today}
**Questions Explored:**
- Project initialization and structure setup

**Insights Generated:**
- Established clear project framework

**Connections Made:**
- 

**Decisions Made:**
- Created project with ${priority} priority
- Set initial status as Planning

**Next Session Focus:**
- Define detailed project scope and objectives`;

    fs.writeFileSync(path.join(projectDir, 'working_log.md'), workingLogContent);
    
    // Copy README files from template
    const templateDir = './project_ideas/_project_template';
    if (fs.existsSync(templateDir)) {
      ['research', 'chats'].forEach(dir => {
        const readmeSource = path.join(templateDir, dir, 'README.md');
        const readmeDest = path.join(projectDir, dir, 'README.md');
        if (fs.existsSync(readmeSource)) {
          fs.copyFileSync(readmeSource, readmeDest);
        }
      });
    }
    
    console.log(`\\n✅ Project created successfully!`);
    console.log(`📁 Location: ${projectDir}`);
    console.log(`📝 Index file: ${projectDir}/index.md`);
    console.log(`📊 Working log: ${projectDir}/working_log.md`);
    console.log(`\\n💡 Next steps:`);
    console.log(`1. Open the index.md file to define your objectives`);
    console.log(`2. Use the knowledge-insight-partner agent to explore connections`);
    console.log(`3. Start gathering relevant research in the research/ folder`);
    
  } catch (error) {
    console.error('Error creating project:', error.message);
  } finally {
    rl.close();
  }
}

createNewProject();