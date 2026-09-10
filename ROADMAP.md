# Deez-MATH Roadmap

## Epics

- [x] Explorer PWA for OpenAI’s ten Astra advances (plain + deep + demos)
- [x] Incorporate other major 2026 landmarks (Jacobian, unit-distance, Fields, Cohen–Lenstra, #728)
- [x] Open problems catalog — Clay Millennium (6) + Goldbach, twin primes, Collatz, Jacobian dim 2
- [x] Optional Lean certificate status badges (external verify link only)
- [ ] Bi-weekly Cursor Automation for catalog + safe dep updates (`docs/biweekly-update-automation.md`)
- [ ] Optional Tauri shell for desktop packaging

## Deferred

- 2026-08-08: No Lean runtime embedding — verify proofs outside the app. `src/data/breakthroughs.ts`
- 2026-08-08: No independent proof verification — honesty disclaimer only. `src/pages/Home.tsx`
- 2026-08-08: Tauri packaging skipped — PWA-first. `ROADMAP.md`
- 2026-08-08: No GitHub Actions — local `run.command` / build only. `package.json`
- 2026-08-09: No interactive demos for open problems — explainer + header Go deeper only. `src/pages/OpenProblemDetail.tsx`
- 2026-08-09: No live prize-status / claim tracking beyond static copy. `src/data/openProblems.ts`
- 2026-09-10: Catalog catch-up — FLT Lean formalization, >2/3 zeta zeros, Erdős #1196. `src/data/landmarks.ts`
- 2026-09-10: Exact 14-day spacing skipped — cron uses 1st+15th; webhook if strict fortnight needed. `docs/biweekly-update-automation.md`
