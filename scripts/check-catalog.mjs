#!/usr/bin/env node
/**
 * Catalog consistency lever. Rerun after data edits.
 * Checks unique ids/importance, required fields, demo registry coverage.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src/data')
const demosIndex = readFileSync(join(root, 'src/demos/index.tsx'), 'utf8')
const demoFiles = readdirSync(join(root, 'src/demos')).filter((f) => f.endsWith('Demo.tsx'))

/** Top-level catalog entries: objects that declare both id and importance. */
function extractEntries(src, arrayName) {
  const marker = `export const ${arrayName}`
  const start = src.indexOf(marker)
  if (start < 0) throw new Error(`missing ${arrayName}`)
  const slice = src.slice(start)
  const entries = []
  const re =
    /\{\s*\n\s*id:\s*'([^']+)',\s*\n\s*importance:\s*(\d+),([\s\S]*?)(?=\n  \},\n  \{\n|\n  \},\n\])/g
  let m
  while ((m = re.exec(slice))) {
    const id = m[1]
    const importance = Number(m[2])
    const body = m[3]
    const demoId = /demoId:\s*'([^']+)'/.exec(body)?.[1]
    const lean = /lean:\s*\{/.test(body)
    entries.push({ id, importance, demoId, lean })
  }
  return entries
}

const landmarks = extractEntries(
  readFileSync(join(dataDir, 'landmarks.ts'), 'utf8'),
  'landmarkBreakthroughs',
)
const astra = extractEntries(readFileSync(join(dataDir, 'astraTen.ts'), 'utf8'), 'astraBreakthroughs')
const openProblems = extractEntries(
  readFileSync(join(dataDir, 'openProblems.ts'), 'utf8'),
  'openProblems',
)
const all = [...landmarks, ...astra]

const errors = []
const ids = new Set()
const ranks = new Set()
for (const b of all) {
  if (ids.has(b.id)) errors.push(`duplicate breakthrough id: ${b.id}`)
  ids.add(b.id)
  if (ranks.has(b.importance)) errors.push(`duplicate importance ${b.importance} (${b.id})`)
  ranks.add(b.importance)
  if (!b.demoId) errors.push(`${b.id}: missing demoId`)
  else {
    const quoted = [`'${b.demoId}'`, `"${b.demoId}"`, `${b.demoId}:`]
    if (!quoted.some((q) => demosIndex.includes(q))) {
      errors.push(`${b.id}: demoId '${b.demoId}' not in demos/index.tsx`)
    }
  }
}

const openIds = new Set()
const openRanks = new Set()
for (const p of openProblems) {
  if (openIds.has(p.id)) errors.push(`duplicate open problem id: ${p.id}`)
  openIds.add(p.id)
  if (openRanks.has(p.importance)) errors.push(`duplicate open importance ${p.importance}`)
  openRanks.add(p.importance)
}

const required = ['flt-formalization', 'riemann-zeros', 'erdos-1196']
for (const id of required) {
  if (!ids.has(id)) errors.push(`missing required breakthrough: ${id}`)
}

const out = {
  breakthroughs: all.length,
  openProblems: openProblems.length,
  demos: demoFiles.length,
  withLean: all.filter((b) => b.lean).length,
  requiredPresent: required.every((id) => ids.has(id)),
  ok: errors.length === 0,
  errors,
}

console.log(JSON.stringify(out, null, 2))
process.exit(errors.length ? 1 : 0)
