// src/components/editor/ProblemPanel.tsx
import { useState } from 'react'
import type { Problem } from '@/lib/types'
import { BookOpen, FlaskConical } from 'lucide-react'

interface Props { problem: Problem }

export default function ProblemPanel({ problem }: Props) {
  const [tab, setTab] = useState<'desc' | 'cases'>('desc')
  const publicCases = problem.cases.filter(c => c.visibility === 'public')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        {[
          { key: 'desc',  label: '題目說明', icon: <BookOpen size={13} /> },
          { key: 'cases', label: `測試案例 (${publicCases.length})`, icon: <FlaskConical size={13} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors
              ${tab === t.key
                ? 'text-brand-400 border-b-2 border-brand-500 -mb-px bg-slate-900/50'
                : 'text-slate-500 hover:text-slate-300'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        {tab === 'desc' && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-bold text-white">{problem.title}</h2>

            <section>
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">問題描述</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
            </section>

            {problem.inputFormat && (
              <section>
                <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">輸入格式</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{problem.inputFormat}</p>
              </section>
            )}

            {problem.outputFormat && (
              <section>
                <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">輸出格式</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{problem.outputFormat}</p>
              </section>
            )}

            {problem.examples?.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">範例</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">輸入</div>
                        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                          {ex.input || '（無）'}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">輸出</div>
                        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 whitespace-pre-wrap">
                          {ex.output}
                        </pre>
                      </div>
                    </div>
                    {ex.explanation && (
                      <p className="mt-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg px-3 py-2 border-l-2 border-brand-700">
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {tab === 'cases' && (
          <div className="space-y-4 animate-fade-in">
            {publicCases.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">沒有公開測試案例</p>
            )}
            {publicCases.map((c, i) => (
              <div key={i} className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
                  <span className="text-xs font-semibold text-slate-300">{c.caseTitle}</span>
                  <span className="text-xs text-slate-500">{c.score} 分</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">輸入</div>
                    <pre className="bg-slate-900 rounded p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                      {c.input || '（無）'}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">預期輸出</div>
                    <pre className="bg-slate-900 rounded p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                      {c.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}

            {problem.cases.filter(c => c.visibility === 'hidden').length > 0 && (
              <p className="text-xs text-slate-600 text-center pt-2">
                另有 {problem.cases.filter(c => c.visibility === 'hidden').length} 個隱藏測試案例（送出後計分）
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
