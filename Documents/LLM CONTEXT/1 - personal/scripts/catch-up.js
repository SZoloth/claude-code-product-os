#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files modified in the last N days
function getRecentFiles(days = 3) {
  try {
    const output = execSync(`find . -name "*.md" -mtime -${days} -type f`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f);
  } catch (error) {
    return [];
  }
}

// Read daily progress files from the last N days
function getRecentProgress(days = 3) {
  const progressDir = './daily_progress';
  const progressFiles = [];
  
  if (!fs.existsSync(progressDir)) {
    return [];
  }
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const progressFile = path.join(progressDir, `${dateStr}.md`);
    
    if (fs.existsSync(progressFile)) {
      const content = fs.readFileSync(progressFile, 'utf8');
      progressFiles.push({
        date: dateStr,
        content: content
      });
    }
  }
  
  return progressFiles;
}

// Create catch-up summary
function createCatchUp(days = 3) {
  const recentFiles = getRecentFiles(days);
  const progressFiles = getRecentProgress(days);
  
  console.log(`\\n=== CATCH-UP SUMMARY: Last ${days} Days ===\\n`);
  
  console.log(`📊 ACTIVITY OVERVIEW:`);
  console.log(`- ${recentFiles.length} files modified`);
  console.log(`- ${progressFiles.length} daily progress entries found\\n`);
  
  if (progressFiles.length > 0) {
    console.log(`📝 RECENT PROGRESS HIGHLIGHTS:\\n`);
    
    progressFiles.reverse().forEach(({ date, content }) => {
      console.log(`**${date}:**`);
      
      // Extract key insights and decisions
      const lines = content.split('\\n');
      let inInsights = false;
      let inDecisions = false;
      let inFocus = false;
      
      lines.forEach(line => {
        if (line.includes('## Key Insights')) {
          inInsights = true;
          inDecisions = false;
          inFocus = false;
        } else if (line.includes('## Decisions Made')) {
          inInsights = false;
          inDecisions = true;
          inFocus = false;
        } else if (line.includes("## Tomorrow's Focus")) {
          inInsights = false;
          inDecisions = false;
          inFocus = true;
        } else if (line.startsWith('## ')) {
          inInsights = false;
          inDecisions = false;
          inFocus = false;
        }
        
        if ((inInsights || inDecisions || inFocus) && line.startsWith('- ') && line.length > 2) {
          console.log(`  ${line}`);
        }
      });
      console.log('');
    });
  }
  
  if (recentFiles.length > 0) {
    console.log(`📁 RECENTLY MODIFIED FILES:\\n`);
    
    // Group by directory
    const filesByDir = {};
    recentFiles.forEach(file => {
      const dir = path.dirname(file);
      if (!filesByDir[dir]) filesByDir[dir] = [];
      filesByDir[dir].push(path.basename(file));
    });
    
    Object.keys(filesByDir).sort().forEach(dir => {
      console.log(`**${dir}:**`);
      filesByDir[dir].forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log('');
    });
  }
  
  console.log(`💡 RECOMMENDED NEXT ACTIONS:\\n`);
  console.log(`1. Review any unfinished items from recent progress entries`);
  console.log(`2. Check if any modified files need follow-up work`);
  console.log(`3. Consider using the knowledge-insight-partner agent to explore connections`);
  console.log(`4. Update any project working logs if applicable\\n`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const days = args[0] ? parseInt(args[0]) : 3;

createCatchUp(days);