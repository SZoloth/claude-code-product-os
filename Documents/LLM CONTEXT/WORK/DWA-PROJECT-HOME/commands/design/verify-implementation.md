# Design Implementation Verification Workflow

## Usage
`/verify-implementation figma_design_file implementation_path [component_name]`

## Task Objective
Verify that UI implementations match Figma design specifications through systematic comparison. Identify gaps, inconsistencies, and accessibility issues between design and code.

## Detailed Sequence of Steps

### Phase 1: Design Specification Analysis
1. **Figma Design Review**
   - Use `read_file` to analyze Figma design specifications or exported assets
   - Extract key design tokens (colors, spacing, typography, dimensions)
   - Document component hierarchy and interaction patterns

2. **Implementation Context**
   - Use `read_file` to examine the current implementation code
   - Use `search_files` to locate related component files and stylesheets
   - Use `glob` to identify all relevant UI implementation files

### Phase 2: Systematic Comparison
3. **Visual Elements Verification**
   - Compare layout and spacing measurements
   - Verify color values and typography specifications
   - Check component dimensions and proportions

4. **Interactive Behavior Analysis**
   - Review hover states, transitions, and animations
   - Verify responsive behavior across breakpoints
   - Check accessibility features and keyboard navigation

### Phase 3: Technical Implementation Review
5. **Code Quality Assessment**
   - Review CSS/styling implementation for maintainability
   - Check for proper semantic HTML structure
   - Verify component reusability and modularity

6. **Accessibility Compliance**
   - Check ARIA labels and semantic markup
   - Verify color contrast ratios meet WCAG standards
   - Review keyboard navigation and screen reader compatibility

### Phase 4: Gap Analysis and Reporting
7. **Discrepancy Documentation**
   - Use `write_file` to create detailed gap analysis report
   - Include screenshots or visual comparisons where helpful
   - Prioritize issues by impact on user experience

8. **Implementation Recommendations**
   - Provide specific code changes needed for design compliance
   - Suggest improvements for accessibility and maintainability
   - Use `ask_followup_question` to clarify design intent when ambiguous

## Output Deliverables
- **Verification Report**: Comprehensive comparison of design vs implementation
- **Gap Analysis**: Prioritized list of discrepancies requiring attention
- **Code Recommendations**: Specific changes needed for design compliance
- **Accessibility Checklist**: WCAG compliance status and improvement suggestions