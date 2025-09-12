# Subagent Creation Workflow

## Usage
`/create-subagent agent_purpose [specialization_domain] [workflow_complexity=standard]`

## Task Objective
Design and implement highly effective specialized subagents for specific domains or tasks. Create complete agent specifications with clear capabilities, constraints, and integration patterns.

## Detailed Sequence of Steps

### Phase 1: Requirements Analysis and Domain Modeling
1. **Purpose Definition and Scope**
   - Analyze the specific problem or domain requiring specialized expertise
   - Use `ask_followup_question` to clarify agent objectives and success criteria
   - Define boundaries between this agent and existing capabilities

2. **Domain Expertise Mapping**
   - Research best practices and methodologies in the specialization domain
   - Use `search_files` to find existing patterns and frameworks in the repository
   - Identify required knowledge areas and skill sets

### Phase 2: Agent Architecture and Capability Design
3. **Interaction Pattern Design**
   - Define how users will invoke and interact with the subagent
   - Design input parameters and expected outputs
   - Plan integration with Claude Code's existing tool ecosystem

4. **Knowledge and Skill Specification**
   - Define the agent's specialized knowledge base and expertise areas
   - Specify problem-solving approaches and methodologies
   - Design quality criteria and output standards

### Phase 3: Implementation and Tool Integration
5. **Agent Prompt Engineering**
   - Use `write_file` to create comprehensive agent specification
   - Include personality, constraints, and behavioral guidelines
   - Define tool usage patterns and permissions

6. **Workflow and Process Definition**
   - Design step-by-step processes for complex tasks
   - Include decision trees and error handling approaches
   - Specify collaboration patterns with other agents or workflows

### Phase 4: Validation and Documentation
7. **Testing and Refinement**
   - Create test scenarios to validate agent effectiveness
   - Use `ask_followup_question` to gather feedback on agent design
   - Refine capabilities based on testing results

8. **Documentation and Integration Guide**
   - Use `write_file` to create comprehensive usage documentation
   - Include examples, best practices, and troubleshooting guides
   - Document integration with existing workflows and systems

## Complexity Levels

### Standard Complexity
- Single-domain expertise with defined workflows
- Limited tool integration and straightforward interaction patterns
- Suitable for most specialized tasks

### Advanced Complexity
- Multi-domain expertise with complex decision trees
- Extensive tool integration and sophisticated interaction patterns
- Suitable for high-stakes or multi-step processes

### Expert Complexity
- Cutting-edge domain knowledge with adaptive capabilities
- Full tool ecosystem integration and autonomous operation
- Suitable for research, strategic analysis, or complex problem-solving

## Output Deliverables
- **Subagent Specification**: Complete agent definition with capabilities and constraints
- **Integration Guide**: How to use the agent within existing workflows
- **Test Scenarios**: Validation cases and expected outcomes
- **Usage Documentation**: Examples, best practices, and troubleshooting guide