# Practice OS — Context Index

This folder contains all working context for the Practice OS project. Load the files relevant to your task. Don't repeat context across sessions — these are the source of truth.

## Files

| File | What's In It | When to Load |
|------|-------------|--------------|
| `01-product-overview.md` | What the product is, taglines, elevator pitch, entry wedge, positioning | Always — start here |
| `02-icp.md` | Ideal customer profile — who we're building for, their frustrations, their current stack | UX design, copy, user research |
| `03-competitive-landscape.md` | All competitors by tier, why each doesn't solve the problem, the gap, language guidance | Positioning, feature decisions |
| `04-feature-strategy.md` | What we're building and why, phased roadmap, what we're NOT building, integration strategy | Feature scoping, product decisions |
| `05-signal-testing-plan.md` | How to get first 5 therapist conversations, discovery call guide, concierge test | Customer discovery, outreach |
| `06-build-context.md` | Stack, data model, v1 feature scope, AI usage pattern, HIPAA notes | Engineering, Claude Code sessions |

## Project Status
- **Stage**: Pre-build. In customer discovery phase.
- **Hypothesis being tested**: Solo therapists have no visibility into the business health of their practice and will pay for a tool that surfaces dropout risk, capacity intelligence, and financial clarity in therapist-friendly language.
- **Next action**: Complete 5 discovery calls. Run concierge test with 3 therapists before writing any code.

## Key Decisions Already Made
- Entry wedge is **Caseload Intelligence** (not AI notes — that's commodity)
- Target is **solo therapist**, not group practice
- Language must be therapist-native: "who might be pulling back?" not "churn risk"
- Stack: Next.js + Supabase + Claude API
- Integration target: SimplePractice API first (most common EHR for solo)
- Price point: $49–79/month

## Founder Context
- Praveen Rao — Principal PM at Thumbtack, exploring founding/early PM roles at AI startups
- Has built: LoopEngine (multi-agent product discovery), LoanFlow AI (mortgage broker vertical SaaS on Next.js/Supabase/Claude API)
- Familiar with: Claude API, TokenRouter pattern (Haiku/Sonnet), Next.js, Supabase, multi-agent pipelines
- Design philosophy: AI Builder PM — hands-on prototyping + PM strategy

## Contact
v.praveen.rao@gmail.com
