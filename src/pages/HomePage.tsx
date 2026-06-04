// src/pages/HomePage.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProblemStore } from '@/stores/problemStore'
import { useAuthStore } from '@/stores/authStore'
import { Code2, ChevronRight, Trophy, Lock, LogIn } from 'lucide-react'

export default function HomePage() {
  const { problems, loading, fetchProblems } = useProblemStore()
  const { user, signIn } = useAuthStore()

  useEffect(() => { fetchProblems() }, [])

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-950 border border-brand-800 text-brand-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          前端計分版 ・ 練習使用
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          宜蘭縣資訊科技創意實作競賽
        </h1>
        <p className="text-slate-400 text-sm">
          使用積木拖曳方式解題，系統自動評分並更新排行榜
        </p>
      </div>

      {/* Login prompt */}
      {!user && (
        <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm flex-1">
            訪客可練習與自行測試，<strong>登入後</strong>可保存成績並更新排行榜。
          </p>
          <button onClick={signIn}
            className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <LogIn size={12} />登入
          </button>
        </div>
      )}

      {/* Problem list */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">題目列表</h2>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && problems.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <Code2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">尚未有題目，請管理員匯入。</p>
          </div>
        )}

        {problems.map((p, idx) => (
          <Link key={p.id} to={`/problem/${p.id}`}
            className="group flex items-center gap-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-700 rounded-xl px-5 py-4 transition-all">
            {/* Number badge */}
            <div className="w-10 h-10 rounded-lg bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors truncate">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {p.cases.length} 個測試案例 ・
                滿分 {p.cases.reduce((s, c) => s + c.score, 0)} 分
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      {problems.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: '題目數', value: problems.length },
            { label: '總分', value: problems.reduce((s,p) => s + p.cases.reduce((a,c) => a+c.score,0), 0) },
            { label: '測試案例', value: problems.reduce((s,p) => s + p.cases.length, 0) },
          ].map(item => (
            <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-brand-400">{item.value}</div>
              <div className="text-xs text-slate-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
