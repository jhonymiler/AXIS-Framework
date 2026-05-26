# STATE — AXIS Framework Playbook (Summary)

## Memory Structure
- **Hot:** active decisions, progress, and blockers (auto-loaded at session start, ≤80 lines)
- **Warm:** deferred ideas, lessons learned, and TODOs (loaded on demand)
- **Cold:** historical archives (`STATE-YYYY-MM.md`), never loaded by default

## Active Decisions
- **Automated quality enforcement:**  
  `axis dedupe` detects duplicated content in `.ai/**/*.md`;  
  `axis spdd verify` ensures Canvas safeguards have matching tests.

- **Non-interactive initialization:**  
  `axis init --preset <node|python|go|docs|minimal>` enables reproducible project bootstrapping without prompts.

- **Formalized memory tiers:**  
  New commands:
  - `axis state hot`
  - `axis state archive`

- **Telemetry (`axis log`):**  
  JSONL-based event tracking (`telemetry.jsonl`) for skills, hooks, and spec churn analysis.

- **Automated hooks:**  
  Hooks under `.ai/hooks/`:
  - `session-start`
  - `post-spec-edit`
  - `stop`  
  Convert written rules into enforced behavior.

- **Skill routing matrix:**  
  `INSTRUCTIONS.md` explicitly defines when to load or avoid each skill.

- **Mandatory session-start ritual:**  
  `STATE.md` must be read before any significant action.

- **Always-on behavioral rules:**  
  Includes:
  - engineering discipline
  - context economy
  - confidence and research controls

- **GitHub Copilot Review integration:**  
  Implemented via symlinks to preserve SST (Single Source of Truth).

- **Discovery Block 4:**  
  Adds governance, workflow, PR, release, and PM tooling support.

- **Harness-first automation:**  
  Validation scripts enforce:
  - file size limits
  - synchronization
  - symlink integrity
  - live/CLI consistency

- **Release-driven CLI publishing:**  
  npm publishing occurs only through GitHub Releases (`cli-vX.Y.Z`).

- **Core architecture:**  
  Framework structured around:
  - Spec
  - Harness
  - Memory

- **REASONS Canvas:**  
  Main SPDD artifact integrated with decomposition and review skills.

- **`axis` CLI:**  
  Commands:
  - `init`
  - `audit`
  - `doctor`
  - `link`
  - `state`
  - `spdd`

- **Recursiveness is mandatory:**  
  The repository itself must obey all framework rules.

## In Progress
- No active blockers or critical infrastructure work.

## Deferred Ideas
- Advanced telemetry consumer
- SPDD skill consolidation
- Bilingual README synchronization
- Post-bootstrap Phase 6

## Lessons Learned
- Rules without automation become aspirational.
- Discovery changes require downstream propagation.
- Manual template synchronization eventually fails.
- Skills must not depend on undefined artifacts.
- Framework claims must be auditable inside the repo itself.

## TODOs
- Document REASONS in `FRAMEWORK.md`
- Revisit skill consolidation
- Expand `axis log analyze` for failure hooks