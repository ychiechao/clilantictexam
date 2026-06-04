// src/components/editor/GradePanel.tsx
import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import type { CaseResult } from '@/lib/types'

interface Props {
  caseResults:  CaseResult[]
  score:        number
  maxScore:     number
  passedCount:  number
  totalCount:   number
  isOfficial?:  boolean
  submittedAt?: number
}

export default function GradePanel({
  caseResults, score, maxScore, passedCount, totalCount, isOfficial, submittedAt,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const scoreColor =
    pct === 100 ? 'text-emerald-400' :
    pct >= 60   ? 'text-amber-400' :
    'text-red-400'

  const toggle = (i: number) => setExpanded(s => {
    const n = new Set(s)
    n.has(i) ? n.delete(i) : n.add(i)
    return n
  })

  // Group by groupTitle
  const groups: Record<string, { result: CaseResult; idx: number }[]> = {}
  caseResults.forEach((r, i) => {
    if (!groups[r.groupTitle]) groups[r.groupTitle] = []
    groups[r.groupTitle].push({ result: r, idx: i })
  })

  return (
    <div className="flex flex-col gap-4 p-4 animate-fade-in">
      {/* Score summary */}
      <div className="flex items-center justify-between bg-slate-900 rounded-xl px-5 py-4 border border-slate-800">
        <div>
          <div className={`text-3xl font-black ${scoreColor}`}>
            {score} <span className="text-lg font-normal text-slate-500">/ {maxScore}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            通過 {passedCount} / {totalCount} 個測資
            {isOfficial && submittedAt && (
              <> ・ {new Date(submittedAt).toLocaleString('zh-TW')}</>
            )}
          </div>
        </div>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={pct === 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round" />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${scoreColor}`}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Cases */}
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 px-1">
            {group}
          </div>
          <div className="space-y-2">
            {items.map(({ result: r, idx }) => (
              <div key={idx} className="rounded-lg border border-slate-800 overflow-hidden">
                <button onClick={() => toggle(idx)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 transition-colors text-left">
                  {r.passed
                    ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    : r.error?.includes('超時')
                      ? <Clock size={15} className="text-amber-400 shrink-0" />
                      : <XCircle size={15} className="text-red-400 shrink-0" />}
                  <span className="flex-1 text-sm text-slate-200">{r.caseTitle}</span>
                  {r.visibility === 'hidden' && (
                    <EyeOff size={12} className="text-slate-600" />
                  )}
                  <span className={`text-xs font-mono ${r.passed ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {r.score}/{r.maxScore}
                  </span>
                  {expanded.has(idx)
                    ? <ChevronDown size={14} className="text-slate-500 shrink-0" />
                    : <ChevronRight size={14} className="text-slate-500 shrink-0" />}
                </button>

                {expanded.has(idx) && (
                  <div className="px-4 py-3 bg-slate-950 text-xs font-mono space-y-2 border-t border-slate-800">
                    {r.error && (
                      <div className="flex gap-2 text-red-400">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{r.error}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-500 mb-1">你的輸出：</div>
                      <pre className="bg-slate-900 rounded px-2 py-1.5 text-slate-300 whitespace-pre-wrap break-all">
                        {r.actualOutput || '（無輸出）'}
                      </pre>
                    </div>
                    {r.visibility === 'public' && (
                      <div>
                        <div className="text-slate-500 mb-1">預期輸出：</div>
                        <pre className="bg-slate-900 rounded px-2 py-1.5 text-slate-300 whitespace-pre-wrap break-all">
                          {r.expectedOutput}
                        </pre>
                      </div>
                    )}
                    {r.visibility === 'hidden' && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <EyeOff size={11} />隱藏測資（不顯示預期答案）
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
