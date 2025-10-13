#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Find files modified in the last 24 hours
function getRecentFiles() {
  try {
    const output = execSync('find . -name "*.md" -mtime -1 -type f', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f && !f.includes('daily_progress'));
  } catch (error) {
    return [];
  }
}

// Create daily progress summary
function createDailyProgress() {
  const recentFiles = getRecentFiles();
  const progressDir = './daily_progress';
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(progressDir)) {
    fs.mkdirSync(progressDir, { recursive: true });
  }
  
  const progressFile = path.join(progressDir, `${today}.md`);
  
  let content = `# Daily Progress: ${today}\n\n`;
  content += `## Files Modified Today\n\n`;
  
  if (recentFiles.length === 0) {
    content += `No markdown files were modified today.\n\n`;
  } else {
    recentFiles.forEach(file => {
      content += `- ${file}\n`;
    });
    content += `\n`;
  }
  
  content += `## Key Insights\n\n`;
  content += `- \n\n`;
  content += `## Decisions Made\n\n`;
  content += `- \n\n`;
  content += `## Blockers/Questions\n\n`;
  content += `- \n\n`;
  content += `## Tomorrow's Focus\n\n`;
  content += `- \n\n`;
  
  fs.writeFileSync(progressFile, content);
  console.log(`Daily progress file created: ${progressFile}`);
  console.log(`Found ${recentFiles.length} files modified today.`);
}

createDailyProgress();