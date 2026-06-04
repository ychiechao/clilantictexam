// src/lib/gradingEngine.ts
import type { Problem, CaseResult, Submission } from './types'

export interface GradeOptions {
  problem:    Problem
  code:       string
  xml:        string
  userId:     string
  userName:   string
  onlyPublic?: boolean   // true = self-test mode (only run public cases)
  timeoutMs?:  number
}

export interface GradeResult {
  score:       number
  maxScore:    number
  passedCount: number
  totalCount:  number
  caseResults: CaseResult[]
}

function normalizeOutput(s: string): string {
  return s.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export async function gradeCode(opts: GradeOptions): Promise<GradeResult> {
  const { problem, code, onlyPublic = false, timeoutMs = 3000 } = opts

  const cases = onlyPublic
    ? problem.cases.filter(c => c.visibility === 'public')
    : problem.cases

  if (cases.length === 0) {
    return { score: 0, maxScore: 0, passedCount: 0, totalCount: 0, caseResults: [] }
  }

  // Spawn a fresh worker per grading session
  const worker = new Worker(
    new URL('../workers/gradingWorker.ts', import.meta.url),
    { type: 'module' }
  )

  const workerResult = await new Promise<{ results: { actualOutput: string; error?: string; timedOut?: boolean }[] }>(
    (resolve, reject) => {
      const t = setTimeout(() => {
        worker.terminate()
        reject(new Error('Worker global timeout'))
      }, timeoutMs * cases.length + 5000)

      worker.onmessage = (e) => {
        clearTimeout(t)
        resolve(e.data)
      }
      worker.onerror = (e) => {
        clearTimeout(t)
        reject(new Error(e.message))
      }

      worker.postMessage({
        code,
        inputs: cases.map(c => c.input),
        timeoutMs,
      })
    }
  )

  worker.terminate()

  let score    = 0
  let maxScore = 0
  let passed   = 0

  const caseResults: CaseResult[] = cases.map((c, i) => {
    const { actualOutput = '', error, timedOut } = workerResult.results[i] ?? {}
    const expected = normalizeOutput(c.output)
    const actual   = normalizeOutput(actualOutput)
    const ok       = !error && !timedOut && actual === expected

    maxScore += c.score
    if (ok) { score += c.score; passed++ }

    return {
      caseTitle:      c.caseTitle,
      groupTitle:     c.groupTitle,
      passed:         ok,
      score:          ok ? c.score : 0,
      maxScore:       c.score,
      actualOutput:   actual,
      expectedOutput: c.visibility === 'public' ? c.output : '（隱藏）',
      error:          error ?? (timedOut ? '執行超時' : undefined),
      visibility:     c.visibility,
    }
  })

  return {
    score,
    maxScore,
    passedCount: passed,
    totalCount:  cases.length,
    caseResults,
  }
}
