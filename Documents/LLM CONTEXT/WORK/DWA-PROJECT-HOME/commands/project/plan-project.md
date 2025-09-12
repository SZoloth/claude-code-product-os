# Project Planning Workflow

## Usage
`/plan-project project_name [scope_file] [linear_integration=true]`

## Task Objective
Create a comprehensive, structured project plan with task breakdown, timeline estimation, risk assessment, and Linear integration. Transform high-level project goals into actionable, trackable work items.

## Detailed Sequence of Steps

### Phase 1: Project Discovery and Scoping
1. **Gather Project Context**
   - Use `read_file` to analyze provided scope documents or project briefs
   - Use `search_files` to find related project documentation in the repository
   - Use `grep` to identify existing project patterns and conventions

2. **Validate Project Requirements**
   - Use `ask_followup_question` to clarify project objectives and success criteria
   - Confirm timeline expectations and resource constraints
   - Identify key stakeholders and decision-makers

### Phase 2: Work Breakdown and Planning
3. **Create Project Structure**
   - Break down the project into logical phases and milestones
   - Identify dependencies between work items
   - Estimate effort and timeline for each component

4. **Risk Assessment**
   - Identify potential blockers and technical challenges
   - Assess resource availability and skill gaps
   - Plan mitigation strategies for high-risk items

### Phase 3: Documentation and Tool Integration
5. **Generate Project Artifacts**
   - Use `write_file` to create structured project plan document
   - Generate timeline with milestones and deliverables
   - Create risk register with mitigation strategies

6. **Linear Integration** (if enabled)
   - Use `bash` to run Linear CLI commands for project setup
   - Create epic and related issues with proper labels and assignments
   - Set up project tracking and reporting structure

### Phase 4: Validation and Handoff
7. **Review and Refinement**
   - Present plan structure to stakeholders for feedback
   - Adjust timeline and scope based on input
   - Finalize resource allocation and assignments

8. **Documentation Handoff**
   - Create project kickoff materials
   - Set up progress tracking mechanisms
   - Document communication protocols and meeting cadence

## Output Deliverables
- **Project Plan Document**: Comprehensive plan with phases, tasks, timeline
- **Risk Register**: Identified risks with mitigation strategies
- **Linear Epic/Issues**: (Optional) Structured work items in Linear
- **Project Charter**: High-level project overview and success criteria