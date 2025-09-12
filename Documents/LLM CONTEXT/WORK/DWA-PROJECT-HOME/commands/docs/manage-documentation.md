# Documentation Management Workflow

## Usage
`/manage-documentation project_directory [action=organize] [doc_type=all]`

## Task Objective
Maintain project continuity through systematic organization, consolidation, and generation of structured project documentation. Ensure information findability and reduce documentation debt.

## Detailed Sequence of Steps

### Phase 1: Documentation Discovery and Assessment
1. **Repository Scanning**
   - Use `glob` to identify all documentation files in specified directories
   - Use `search_files` to find orphaned or misplaced documentation
   - Catalog existing documentation by type, age, and relevance

2. **Content Analysis**
   - Use `read_file` to assess quality and completeness of key documents
   - Identify outdated, duplicate, or conflicting information
   - Map relationships between documents and projects

### Phase 2: Organization and Structure Planning
3. **Information Architecture Design**
   - Analyze current directory structure and propose improvements
   - Group related documents by project, topic, or workflow
   - Design navigation and discovery mechanisms

4. **Action Plan Development**
   - Prioritize documentation tasks based on impact and effort
   - Use `ask_followup_question` to confirm organization approach
   - Plan consolidation and archival activities

### Phase 3: Documentation Processing (Action-Dependent)

#### For Organization Action:
5. **File Structure Optimization**
   - Create logical directory hierarchy
   - Move misplaced files to appropriate locations
   - Establish naming conventions and standards

6. **Cross-Reference Management**
   - Update internal links and references
   - Create index files and navigation aids
   - Ensure document discoverability

#### For Consolidation Action:
5. **Duplicate Resolution**
   - Identify and merge duplicate content
   - Resolve conflicting information
   - Archive obsolete versions

6. **Content Synthesis**
   - Use `write_file` to create consolidated documents
   - Maintain version history and attribution
   - Update references to consolidated content

#### For Generation Action:
5. **Template Application**
   - Create structured documents using established templates
   - Generate missing documentation (READMEs, guides, specifications)
   - Ensure consistency with project standards

6. **Content Creation**
   - Use `write_file` to generate comprehensive documentation
   - Include examples, workflows, and decision rationale
   - Create discoverable entry points for new team members

### Phase 4: Quality Assurance and Maintenance Setup
7. **Documentation Review**
   - Verify completeness and accuracy of organized content
   - Check for broken links and missing references
   - Ensure accessibility and readability

8. **Maintenance Framework**
   - Establish documentation ownership and update procedures
   - Create maintenance checklists and review cycles
   - Document the documentation system itself

## Output Deliverables
- **Organized Documentation**: Logically structured and accessible project docs
- **Documentation Map**: Overview of all project documentation and relationships
- **Maintenance Guide**: Procedures for keeping documentation current
- **Archive Summary**: Record of consolidated, moved, or deprecated content