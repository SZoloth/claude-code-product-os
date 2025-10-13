# CLAUDE.md - Marathon Training

## Folder Purpose

This folder contains comprehensive marathon training documentation including training plans, progress tracking, and race preparation materials for the Marine Corps Marathon and other running goals.

## Key Guidelines

- **Performance-Focused**: All content should support improved running performance and race preparation
- **Data-Driven**: Use Strava data and training metrics to inform decisions and track progress
- **Safety-First**: Prioritize injury prevention and sustainable training practices
- **Goal-Oriented**: Maintain focus on specific race goals and performance targets

## Content Organization

### Core Training Documents
- **master_mcm_training_plan.md**: Master Marine Corps Marathon training schedule
- **mcm_training_log.md**: Progress tracking and workout documentation
- **marathon_training_guides.md**: Training methodology and guidance resources

### Supporting Resources
- **all marathon prompt pieces excluding recipes.md**: Comprehensive training resource compilation
- **z_archive/**: Historical training plans and archived documents

## Working with this Content

When working with files in this folder:

1. **Strava Integration**: Always check Strava data for current activity status and performance metrics
2. **Progressive Planning**: Ensure training plans build appropriately over time
3. **Recovery Focus**: Balance training intensity with adequate recovery
4. **Injury Prevention**: Monitor for signs of overtraining or injury risk
5. **Date Clarity**: Use absolute dates in YYYY-MM-DD format; avoid relative terms like "today" or "yesterday" so documents remain evergreen.

## Agent Recommendations

- **MUST USE marathon-coach agent** for all training-related activities
- Marathon-coach has direct access to Strava MCP tools for activity data
- Use **meal-planning-chef** agent for training nutrition and fueling strategies
- Connect with **cooking** folder for marathon-specific recipes
- Use **productivity-optimization-specialist** for training schedule optimization

## ⚠️ CRITICAL ERROR PREVENTION PROTOCOLS

### Marathon Coach Agent Requirements

**MANDATORY "Calendar First" Protocol:**
Before ANY training recommendation, the marathon-coach agent MUST:
1. Explicitly verify and state: "Today is [DAY OF WEEK], [FULL DATE]"
2. Cross-reference against master_mcm_training_plan.md for exact workout scheduled
3. State: "According to your training plan, [DAY] in Week [X] calls for: [SPECIFIC WORKOUT]"

**Required Verification Steps:**
- [ ] Calendar date confirmed with user if any uncertainty
- [ ] Training plan consulted as primary source (never work from memory/inference)
- [ ] Recent Strava data checked for actual training context
- [ ] User's stated facts treated as ground truth over AI assumptions

**Error Recovery Protocol:**
If fundamental error discovered (wrong dates, wrong workouts):
1. Acknowledge full scope: "This error invalidates my previous analysis"
2. Identify root cause honestly
3. Rebuild from verified master_mcm_training_plan.md foundations
4. Never patch incorrect assumptions - start fresh

**Assumption Documentation:**
When making time-based assumptions, explicitly state:
"I'm assuming [ASSUMPTION] based on [EVIDENCE]. Please confirm if this is incorrect."

### Training Plan Sacred Text Principle
- master_mcm_training_plan.md is the authoritative source
- Never recommend training based on inference or pattern matching
- Always consult plan directly for specific day's workout
- User corrections override AI assumptions immediately

## Strava Integration

The marathon-coach agent has access to:
- Recent activity data and performance metrics
- Detailed workout analysis and training loads
- Progress tracking against training plans
- Heart rate and power zone analysis

Always leverage Strava data when making training recommendations or adjustments.
