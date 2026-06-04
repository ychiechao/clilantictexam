// src/components/editor/RightPanel.tsx
import { useState, useEffect } from 'react'
import { Play, Send, History, Code, Loader2, LogIn } from 'lucide-react'
import GradePanel from './GradePanel'
import CodeTabs from './CodeTabs'
import type { Problem, Submission } from '@/lib/types'
import { gradeCode } from '@/lib/gradingEngine'
import { saveSubmission, updateUserProblemStat, getUserSubmissions } from '@/lib/submissionService'
import { updateLeaderboard } from '@/lib/leaderboardService'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  problem: Problem
  js:      string
  xml:     string
}

type Tab = 'test' | 'submit' | 'history' | 'code'

export default function RightPanel({ problem, js, xml }: Props) {
  const { user, signIn } = useAuthStore()
  const [tab, setTab] = useState<Tab>('test')
  const [testResult, setTestResult]     = useState<any>(null)
  const [submitResult, setSubmitResult] = useState<any>(null)
  const [history, setHistory]           = useState<Submission[]>([])
  const [running, setRunning]           = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [submitCount, setSubmitCount]   = useState(0)
  const MAX_SUBMITS = 10

  const loadHistory = async () => {
    if (!user) return
    try {
      const subs = await getUserSubmissions(user.uid, problem.id)
      setHistory(subs as Submission[])
      setSubmitCount(subs.length)
    } catch (_) {}
  }

  useEffect(() => { loadHistory() }, [user, problem.id])

  const handleTest = async () => {
    setRunning(true)
    setTab('test')
    try {
      const result = await gradeCode({
        problem, code: js, xml,
        userId: user?.uid ?? 'guest',
        userName: user?.displayName ?? '訪客',
        onlyPublic: true,
      })
      setTestResult(result)
    } catch (e: any) {
      setTestResult({ error: e.message })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) { signIn(); return }
    if (submitCount >= MAX_SUBMITS) {
      alert(`本題最多提交 ${MAX_SUBMITS} 次，已達上限。`)
      return
    }
    setSubmitting(true)
    setTab('submit')
    try {
      const result = await gradeCode({
        problem, code: js, xml,
        userId: user.uid,
        userName: user.displayName,
        onlyPublic: false,
      })
      setSubmitResult(result)

      const submittedAt = Date.now()
      await saveSubmission({
        userId:      user.uid,
        userName:    user.displayName,
        problemId:   problem.id,
        score:       result.score,
        maxScore:    result.maxScore,
        passedCount: result.passedCount,
        totalCount:  result.totalCount,
        blocklyXml:  xml,
        generatedJs: js,
        submittedAt,
        caseResults: result.caseResults,
      })

      await updateUserProblemStat({
        userId:       user.uid,
        problemId:    problem.id,
        bestScore:    result.score,
        maxScore:     result.maxScore,
        attempts:     submitCount + 1,
        solvedAt:     result.score === result.maxScore ? submittedAt : undefined,
        lastSubmitAt: submittedAt,
      })

      await updateLeaderboard(user.uid, user.displayName, user.photoURL)
      await loadHistory()
    } catch (e: any) {
      console.error(e)
      alert('送出失敗：' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'test',    label: '自行測試', icon: <Play size={13} /> },
    { key: 'submit',  label: '正式評分', icon: <Send size={13} /> },
    { key: 'history', label: `紀錄 (${history.length})`, icon: <History size={13} /> },
    { key: 'code',    label: '程式碼', icon: <Code size={13} /> },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Action buttons */}
      <div className="flex gap-2 p-3 border-b border-slate-800 shrink-0">
        <button onClick={handleTest} disabled={running || !js.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
          {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          自行測試
        </button>
        <button onClick={handleSubmit} disabled={submitting || !js.trim() || submitCount >= MAX_SUBMITS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors disabled:opacity-40">
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          {user ? `正式送出 (${submitCount}/${MAX_SUBMITS})` : '登入後送出'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors
              ${tab === t.key
                ? 'text-brand-400 border-b-2 border-brand-500 -mb-px bg-slate-900/50'
                : 'text-slate-500 hover:text-slate-300'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {tab === 'test' && (
          running ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">執行中…</span>
            </div>
          ) : testResult ? (
            <GradePanel {...testResult} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 p-8 text-center">
              <Play size={28} className="opacity-30" />
              <p className="text-sm">點擊「自行測試」執行公開測資</p>
            </div>
          )
        )}

        {tab === 'submit' && (
          submitting ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">評分中，請稍候…</span>
            </div>
          ) : submitResult ? (
            <GradePanel {...submitResult} isOfficial />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 p-8 text-center">
              <Send size={28} className="opacity-30" />
              {user
                ? <p className="text-sm">點擊「正式送出」對全部測資評分並計入排行榜</p>
                : <div>
                    <p className="text-sm mb-3">需要登入才能正式評分</p>
                    <button onClick={signIn} className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs rounded-lg">
                      <LogIn size={13} />Google 登入
                    </button>
                  </div>}
            </div>
          )
        )}

        {tab === 'history' && (
          <div className="p-4 space-y-3 animate-fade-in">
            {!user && (
              <p className="text-sm text-slate-500 text-center py-8">登入後可查看提交紀錄</p>
            )}
            {user && history.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">尚無提交紀錄</p>
            )}
            {history.map((s, i) => {
              const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`text-xl font-black w-16 text-center ${pct === 100 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.score}<span className="text-xs text-slate-500">/{s.maxScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400">{new Date(s.submittedAt).toLocaleString('zh-TW')}</div>
                    <div className="text-xs text-slate-500">通過 {s.passedCount}/{s.totalCount} 測資</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'code' && <CodeTabs js={js} xml={xml} />}
      </div>
    </div>
  )
}
