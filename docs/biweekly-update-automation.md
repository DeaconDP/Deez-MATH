# Bi-weekly Deez-MATH update automation

Durable scheduled runs live in **Cursor Automations** (not conversation timers). Cloud agents cannot create that schedule via MCP — activate once in the UI using this brief.

## Activate (one-time)

1. Open [cursor.com/automations/new](https://cursor.com/automations/new)
2. **Trigger:** Scheduled → custom cron `0 9 1,15 * *` (09:00 on the 1st and 15th — ≈ every two weeks). Prefer timezone **Africa/Johannesburg** if the UI offers it.
3. **Repository:** `DeaconDP/Deez-MATH` (required — cron defaults to no repo)
4. **Tools:** Pull request creation on; Memories on (track last run + what was already covered)
5. **Prompt:** paste the block below
6. Save and enable

Automation home: [cursor.com/automations](https://cursor.com/automations)

## Automation prompt (paste)

```
You are the bi-weekly updater for Deez-MATH (github.com/DeaconDP/Deez-MATH).

Read docs/biweekly-update-automation.md and follow it. Also skim ROADMAP.md, TODO.md, and src/data/* before changing anything.

## Goal
Keep the catalog fresh and the app healthy. Prefer content updates over busywork.

## Do, in order
1. **Memories** — Read prior run notes (last catalog scan date, items already rejected or shipped). Update memories when you finish.
2. **Catalog scan** — Research credible new major math breakthroughs, formalizations, or open-problem status changes since the last run (or last ~3 weeks if memory is empty). Prefer primary sources (papers, Lean repos, Fields/Clay announcements, reputable writeups).
3. **Ship only if warranted** — Add/update entries in src/data/landmarks.ts, astraTen.ts, or openProblems.ts matching existing types and voice (glance + plain; jargon in deep; honest commercial lines on applications; Lean badges only when a public certificate exists). Rank importance consistently with neighbors. Skip trivia, rumors, and duplicates.
4. **Deps (secondary)** — If npm patch/minor updates are clearly safe and needed, bump them. No major bumps unless required to keep the app building.
5. **Verify** — `npm install` if lockfile changed, then `npm run lint` and `npm run build`. Fix what you broke.
6. **PR or stop** — Open a draft PR only when there are real, verified changes. Commit messages include `[skip ci]`. If nothing material changed, do nothing (no empty PR). Summarize what you checked in Memories even when you open no PR.

## Do not
- Add GitHub Actions workflows
- Embed a Lean runtime or claim machine-checked proofs the app does not verify
- Invent breakthroughs, sources, or Lean links
- Redesign UI unless a content change requires a tiny fix
```

## Cadence note

Classic cron has no exact “every 14 days.” `1,15` is the stable bi-monthly stand-in. For strict 14-day spacing, switch the trigger to a webhook and call it from an external scheduler.
