# Fact Checking Workflow

## Usage
`/fact-check source_document [claim_to_verify] [output_format=detailed]`

## Task Objective
Perform rigorous fact-checking and source verification across repository documents. Cross-reference claims, identify discrepancies, and provide credibility assessment with supporting evidence.

## Detailed Sequence of Steps

### Phase 1: Source Analysis and Claim Identification
1. **Document Analysis**
   - Use `read_file` to analyze the source document thoroughly
   - Extract key claims, facts, and assertions requiring verification
   - Identify sources, dates, and attribution for each claim

2. **Claim Prioritization**
   - Categorize claims by importance and verifiability
   - Flag high-impact claims that could affect decisions
   - Use `ask_followup_question` if specific claims need focus

### Phase 2: Cross-Reference Investigation
3. **Repository Search**
   - Use `search_files` to find related documents and sources
   - Use `grep` with specific patterns to locate supporting/contradicting evidence
   - Use `glob` to identify relevant file types and directories

4. **Evidence Gathering**
   - Use `read_file` on identified sources to extract relevant information
   - Compare versions and timestamps of conflicting information
   - Track the provenance of each piece of evidence

### Phase 3: Verification and Analysis
5. **Credibility Assessment**
   - Evaluate source reliability and authority
   - Check for corroborating evidence from multiple sources
   - Identify potential bias or conflicts of interest

6. **Discrepancy Investigation**
   - Document conflicting information with specific citations
   - Analyze possible reasons for discrepancies (timing, context, perspective)
   - Attempt to resolve conflicts through additional research

### Phase 4: Reporting and Documentation
7. **Generate Verification Report**
   - Use `write_file` to create structured fact-check report
   - Include confidence levels for each verified claim
   - Provide specific citations and evidence trails

8. **Recommendation Synthesis**
   - Highlight claims requiring attention or correction
   - Suggest additional verification steps for uncertain claims
   - Recommend document updates or clarifications

## Output Deliverables
- **Fact-Check Report**: Detailed verification status of all claims
- **Evidence Matrix**: Cross-reference table of claims and supporting sources
- **Discrepancy Log**: Documentation of conflicting information found
- **Confidence Assessment**: Reliability ratings for verified information