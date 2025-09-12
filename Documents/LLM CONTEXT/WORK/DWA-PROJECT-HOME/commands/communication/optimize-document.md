# Document Optimization Workflow

## Usage
`/optimize-document source_document [framework=BLUF] [target_audience=general]`

## Task Objective
Transform verbose, lengthy documents into clear, concise, and actionable communications using proven frameworks like BLUF (Bottom Line Up Front) and Minto Pyramid Principle. Achieve 40-60% length reduction while maintaining all critical information.

## Detailed Sequence of Steps

### Phase 1: Document Analysis and Framework Selection
1. **Source Document Assessment**
   - Use `read_file` to analyze the source document structure and content
   - Identify key messages, supporting details, and redundancies
   - Assess current length, complexity, and clarity issues

2. **Framework and Audience Alignment**
   - Select appropriate communication framework (BLUF, Minto Pyramid, SCR)
   - Use `ask_followup_question` to confirm target audience and communication goals
   - Determine optimal document length and format for the context

### Phase 2: Content Restructuring and Prioritization
3. **Message Hierarchy Creation**
   - Extract the core message and supporting arguments
   - Apply pyramid principle to organize supporting details
   - Eliminate redundancies and tangential information

4. **Stakeholder-Focused Editing**
   - Tailor content to specific audience needs and knowledge level
   - Emphasize actionable outcomes and decision points
   - Remove jargon and unnecessary complexity

### Phase 3: Framework Application and Optimization
5. **BLUF Structure Implementation** (if BLUF framework selected)
   - Lead with conclusion and key recommendation
   - Organize supporting evidence in order of importance
   - Include clear action items and next steps

6. **Minto Pyramid Application** (if Minto framework selected)
   - Start with the answer/conclusion
   - Group supporting arguments logically
   - Ensure each level answers "why" or "how" questions

### Phase 4: Quality Assurance and Finalization
7. **Clarity and Readability Review**
   - Use `write_file` to create optimized document version
   - Ensure smooth flow and logical transitions
   - Verify all critical information is preserved

8. **Stakeholder Validation**
   - Present optimized version highlighting key improvements
   - Use `ask_followup_question` to confirm message clarity
   - Make final adjustments based on feedback

## Output Deliverables
- **Optimized Document**: Restructured document with 40-60% length reduction
- **Before/After Comparison**: Analysis showing improvements in clarity and conciseness
- **Message Map**: Visual hierarchy of key messages and supporting points
- **Action Items Summary**: Clear list of decisions needed and next steps