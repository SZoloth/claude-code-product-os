# JIRA Ticket Writing Workflow

## Usage
`/write-jira-ticket research_source ticket_type [epic_name]`

## Task Objective
Create outcome-focused JIRA tickets following empowered product team principles. Transform research insights into actionable development work with clear success metrics and user value.

## Detailed Sequence of Steps

### Phase 1: Research Analysis and Context Gathering
1. **Source Material Review**
   - Use `read_file` to analyze research documents, user feedback, or requirements
   - Extract key user problems, pain points, and desired outcomes
   - Identify technical constraints and business priorities

2. **Ticket Type Determination**
   - Classify work as Story, Bug, Task, or Epic based on scope and nature
   - Use `ask_followup_question` to confirm ticket classification and priority
   - Identify related tickets and dependencies

### Phase 2: Outcome Definition and Success Criteria
3. **User Value Articulation**
   - Define clear user benefit and business value
   - Write user story in empowered team format (problem-focused, not solution-prescriptive)
   - Establish measurable success criteria and acceptance criteria

4. **Technical Context Integration**
   - Use `search_files` to find related technical documentation
   - Include relevant architectural decisions and constraints
   - Reference existing patterns and implementation approaches

### Phase 3: Ticket Construction and Documentation
5. **JIRA Ticket Creation**
   - Use `write_file` to create properly formatted JIRA ticket
   - Include comprehensive description with context and rationale
   - Add appropriate labels, components, and metadata

6. **Acceptance Criteria Definition**
   - Write clear, testable acceptance criteria
   - Include edge cases and error handling requirements
   - Define done criteria including testing and documentation

### Phase 4: Team Alignment and Refinement
7. **Development Team Context**
   - Provide sufficient technical context for implementation decisions
   - Include design assets, mockups, or technical specifications
   - Reference related tickets and dependencies

8. **Stakeholder Review Preparation**
   - Prepare ticket for backlog refinement discussion
   - Include effort estimation guidance and risk factors
   - Use `ask_followup_question` to confirm completeness and clarity

## Output Deliverables
- **JIRA Ticket**: Complete, outcome-focused ticket ready for development
- **Acceptance Criteria**: Clear, testable criteria for completion
- **Technical Context**: Implementation guidance and architectural considerations
- **Success Metrics**: Measurable outcomes and business value indicators