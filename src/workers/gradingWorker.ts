// src/workers/gradingWorker.ts
// Runs inside a Web Worker — no DOM access

interface GradeRequest {
  code:    string
  inputs:  string[]  // one string per test case (lines joined by \n)
  timeoutMs: number
}

interface CaseOutcome {
  actualOutput: string
  error?:       string
  timedOut?:    boolean
}

self.onmessage = async (e: MessageEvent<GradeRequest>) => {
  const { code, inputs, timeoutMs } = e.data
  const results: CaseOutcome[] = []

  for (const input of inputs) {
    const outcome = await runOnce(code, input, timeoutMs)
    results.push(outcome)
  }

  self.postMessage({ results })
}

function runOnce(code: string, input: string, timeoutMs: number): Promise<CaseOutcome> {
  return new Promise(resolve => {
    const lines   = input.split('\n')
    let lineIdx   = 0
    const outputs: string[] = []
    let done      = false

    const timer = setTimeout(() => {
      if (!done) {
        done = true
        resolve({ actualOutput: outputs.join('\n'), timedOut: true, error: '執行超時' })
      }
    }, timeoutMs)

    try {
      // Build a sandboxed function with overridden prompt/print
      const sandboxedCode = `
(function() {
  let __lineIdx = 0;
  const __lines = ${JSON.stringify(lines)};
  const __outputs = [];

  function prompt() {
    return __lines[__lineIdx++] ?? '';
  }

  function print(...args) {
    __outputs.push(args.join(' '));
  }

  // Scratch-style output
  function say(msg) {
    __outputs.push(String(msg));
  }

  ${code}

  return __outputs;
})()
`
      // Use Function constructor (no eval global pollution)
      // eslint-disable-next-line no-new-func
      const fn = new Function('return ' + sandboxedCode)
      const result = fn()
      clearTimeout(timer)
      if (!done) {
        done = true
        resolve({ actualOutput: Array.isArray(result) ? result.join('\n') : '' })
      }
    } catch (err: unknown) {
      clearTimeout(timer)
      if (!done) {
        done = true
        resolve({
          actualOutput: outputs.join('\n'),
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  })
}
