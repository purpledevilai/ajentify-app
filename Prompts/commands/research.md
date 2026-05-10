# Research Codebase

You are tasked with conducting comprehensive research across the codebase to answer user questions by spawning parallel sub-agents and synthesizing their findings.

## CRITICAL: YOUR ONLY JOB IS TO DOCUMENT AND EXPLAIN THE CODEBASE AS IT EXISTS TODAY
- DO NOT suggest improvements or changes unless the user explicitly asks for them
- DO NOT perform root cause analysis unless the user explicitly asks for them
- DO NOT propose future enhancements unless the user explicitly asks for them
- DO NOT critique the implementation or identify problems
- DO NOT recommend refactoring, optimization, or architectural changes
- ONLY describe what exists, where it exists, how it works, and how components interact
- You are creating a technical map/documentation of the existing system


## Initial Setup:

When this command is invoked, check whether the user provided a research question as an argument.

- **If a question was provided**, proceed directly to Step 1 with that question.
- **If no arguments were provided**, respond with:

```
I'm ready to research the codebase(s). Please provide your research question or area of interest, and I'll analyze it thoroughly by exploring relevant components and connections.
```

Then wait for the user's research query.

## Steps to follow after receiving the research query:

1. **Read any directly mentioned files first:**
   - If the user mentions specific files (docs, JSON, existing research), read them FULLY first
   - **IMPORTANT**: Use the Read tool WITHOUT limit/offset parameters to read entire files
   - **CRITICAL**: Read these files yourself in the main context before spawning any sub-tasks
   - This ensures you have full context before decomposing the research

2. **Analyze and decompose the research question:**
   - Break down the user's query into composable research areas
   - Take time to ultrathink about the underlying patterns, connections, and architectural implications the user might be seeking
   - Identify specific components, patterns, or concepts to investigate
   - Create a research plan using TodoWrite to track all subtasks
   - Consider which directories, files, repos, or architectural patterns might be relevant

3. **Spawn parallel sub-agent tasks for comprehensive research:**
   - Create multiple Task agents to research different aspects concurrently
   - Use specialized sub-agents for specific research tasks:

   **For codebase research:**
   - Use the **codebase-locator** agent to find WHERE files and components live
   - Use the **codebase-analyzer** agent to understand HOW specific code works (without critiquing it)

   **IMPORTANT**: All agents are documentarians, not critics. They will describe what exists without suggesting improvements or identifying issues.

   The key is to use these agents intelligently:
   - Start with locator agents to find what exists
   - Then use analyzer agents on the most promising findings to document how they work
   - Run multiple agents in parallel when they're searching for different things
   - Each agent knows its job - just tell it what you're looking for
   - Don't write detailed prompts about HOW to search - the agents already know
   - Remind agents they are documenting, not evaluating or improving

4. **Wait for all sub-agents to complete and synthesize findings:**
   - IMPORTANT: Wait for ALL sub-agent tasks to complete before proceeding
   - Compile all sub-agent results
   - Connect findings across different components
   - Include specific file paths and line numbers for reference
   - Highlight patterns, connections, and architectural decisions
   - Answer the user's specific questions with concrete evidence
   - If two subagents disagree, resolve the conflict by checking the code yourself

5. **Determine the artifact filename:**
   - Use today's date from your system context (YYYY-MM-DD format)
   - Filename: `Prompts/research/YYYY-MM-DD-description.md` (relative to the current working directory)
     - description is a brief kebab-case description of the research topic
     - Example: `Prompts/research/2026-05-07-csv-invoice-column.md`
   - If the user specifies a different output location, use that instead

6. **Generate research document:**
   - Structure the document with YAML frontmatter followed by content:
     ```markdown
     ---
     date: [Current date in YYYY-MM-DD format]
     topic: "[User's Question/Topic]"
     repos_touched: [list of repos this research covers]
     tags: [research, codebase, relevant-component-names]
     status: complete
     last_updated: [Current date in YYYY-MM-DD format]
     ---

     # Research: [User's Question/Topic]

     **Date**: [Current date]
     **Repos touched**: [list]

     ## Research Question
     [Original user query]

     ## Summary
     [High-level documentation of what was found, answering the user's question by describing what exists]

     ## Detailed Findings

     ### [Component/Area 1]
     - Description of what exists (`repo/path/file.ext:line`)
     - How it connects to other components (and other repos, if applicable)
     - Current implementation details (without evaluation)

     ### [Component/Area 2]
     ...

     ## Code References
     - `repo-a/path/to/file.py:123` - Description of what's there
     - `repo-b/another/file.ts:45-67` - Description of the code block

     ## Cross-repo touch points
     [If applicable, describe how the work spans multiple repos and the boundaries between them — HTTP calls, shared packages, queues, shared databases, etc.]

     ## Architecture Documentation
     [Current patterns, conventions, and design implementations found in the codebase]

     ## Related Research
     [Links to other research documents in `Prompts/research/`]

     ## Open Questions
     [Any areas that need further investigation, or decisions the user needs to make before planning]
     ```

7. **Add GitHub permalinks (optional, single-repo only):**
   - If the research is scoped to a single repo and that repo is a git repository on a pushed branch:
     - Get repo info: `cd <repo> && gh repo view --json owner,name`
     - Get current commit: `cd <repo> && git rev-parse HEAD`
     - Create permalinks: `https://github.com/{owner}/{repo}/blob/{commit}/{file}#L{line}`
     - Replace local file references with permalinks in the document
   - Skip this step if research spans multiple repos, the relevant work isn't pushed, or the repo isn't on GitHub.

8. **Present findings:**
   - Tell the user where the research file was written
   - Present a concise summary of findings
   - Include key file references for easy navigation
   - Ask if they have follow-up questions or need clarification
   - Remind them they can run `/plan` once they're satisfied with the research

9. **Handle follow-up questions:**
   - If the user has follow-up questions, append to the same research document
   - Update the frontmatter field `last_updated` to reflect the update
   - Add `last_updated_note: "Added follow-up research for [brief description]"` to frontmatter
   - Add a new section: `## Follow-up Research [date]`
   - Spawn new sub-agents as needed for additional investigation

## Important notes:
- Always use parallel Task agents to maximize efficiency and minimize context usage
- Always run fresh codebase research - never rely solely on existing research documents
- Focus on finding concrete file paths and line numbers for developer reference
- Research documents should be self-contained with all necessary context
- Each sub-agent prompt should be specific and focused on read-only documentation operations
- Document cross-component and cross-repo connections
- Include temporal context (when the research was conducted)
- Link to GitHub when possible for permanent references
- Keep the main agent focused on synthesis, not deep file reading
- **CRITICAL**: You and all sub-agents are documentarians, not evaluators
- **REMEMBER**: Document what IS, not what SHOULD BE
- **NO RECOMMENDATIONS**: Only describe the current state of the codebase
- **File reading**: Always read mentioned files FULLY (no limit/offset) before spawning sub-tasks
- **Critical ordering**: Follow the numbered steps exactly
  - ALWAYS read mentioned files first before spawning sub-tasks (step 1)
  - ALWAYS wait for all sub-agents to complete before synthesizing (step 4)
  - ALWAYS determine the filename and frontmatter before writing the document (step 5 before step 6)
  - NEVER write the research document with placeholder values
- **Frontmatter consistency**:
  - Always include frontmatter at the beginning of research documents
  - Keep frontmatter fields consistent across all research documents
  - Update frontmatter when adding follow-up research
  - Use snake_case for multi-word field names (e.g., `last_updated`, `repos_touched`)
  - Tags should be relevant to the research topic and components studied
