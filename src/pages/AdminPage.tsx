// src/pages/AdminPage.tsx
import { useState } from 'react'
import { useProblemStore } from '@/stores/problemStore'
import { ShieldCheck, Upload, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import type { Problem } from '@/lib/types'

const EXAMPLE_JSON = JSON.stringify({
  id: "prob_example",
  title: "範例題目：計算總和",
  description: "給定 N 個整數，請輸出它們的總和。",
  inputFormat: "第一行輸入整數 N，接下來 N 行每行一個整數。",
  outputFormat: "輸出一個整數，代表總和。",
  examples: [
    { input: "3\n1\n2\n3", output: "6", explanation: "1+2+3=6" }
  ],
  cases: [
    { groupTitle: "基本測資", caseTitle: "測試案例 1", input: "3\n1\n2\n3", output: "6", score: 20, visibility: "public" },
    { groupTitle: "基本測資", caseTitle: "測試案例 2", input: "5\n10\n20\n30\n40\n50", output: "150", score: 20, visibility: "public" },
    { groupTitle: "隱藏測資", caseTitle: "測試案例 3", input: "1\n999", output: "999", score: 30, visibility: "hidden" },
    { groupTitle: "隱藏測資", caseTitle: "測試案例 4", input: "4\n-1\n-2\n3\n4", output: "4", score: 30, visibility: "hidden" },
  ]
}, null, 2)

function validateProblem(p: any): string | null {
  if (!p.title)       return '缺少 title'
  if (!p.description) return '缺少 description'
  if (!Array.isArray(p.cases) || p.cases.length === 0) return 'cases 必須是非空陣列'
  for (const c of p.cases) {
    if (!c.caseTitle)  return `測試案例缺少 caseTitle`
    if (!c.groupTitle) return `測試案例 "${c.caseTitle}" 缺少 groupTitle`
    if (c.output === undefined || c.output === null) return `測試案例 "${c.caseTitle}" 缺少 output`
    if (typeof c.score !== 'number') return `測試案例 "${c.caseTitle}" 的 score 必須是數字`
    if (!['public','hidden'].includes(c.visibility)) return `測試案例 "${c.caseTitle}" 的 visibility 必須是 public 或 hidden`
  }
  return null
}

export default function AdminPage() {
  const { problems, importProblem, deleteProblem, fetchProblems } = useProblemStore()
  const [json, setJson]       = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleImport = async () => {
    setError(''); setSuccess('')
    let parsed: any
    try {
      parsed = JSON.parse(json)
    } catch (_) {
      setError('JSON 格式錯誤，請檢查括號與逗號。')
      return
    }

    // Support both single object and array
    const items: any[] = Array.isArray(parsed) ? parsed : [parsed]
    for (const item of items) {
      const err = validateProblem(item)
      if (err) { setError(`驗證失敗：${err}`); return }
    }

    setSaving(true)
    try {
      for (const item of items) {
        await importProblem(item as Omit<Problem, 'id'> & { id?: string })
      }
      setSuccess(`成功匯入 ${items.length} 道題目！`)
      setJson('')
    } catch (e: any) {
      setError('寫入失敗：' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`確定要刪除「${title}」？此操作無法還原。`)) return
    setDeleting(id)
    try { await deleteProblem(id) }
    finally { setDeleting(null) }
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck size={24} className="text-amber-400" />
        <div>
          <h1 className="text-2xl font-black text-white">管理後台</h1>
          <p className="text-xs text-slate-500 mt-0.5">前端計分版 ・ 適合練習使用</p>
        </div>
      </div>

      {/* Import */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Upload size={16} className="text-brand-400" />匯入題目
        </h2>
        <p className="text-xs text-slate-500">
          貼上單一題目 JSON 或陣列 JSON（一次匯入多題）。
        </p>

        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={14}
          placeholder="在此貼上題目 JSON…"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-600 resize-y scrollbar-thin"
        />

        {error   && <div className="flex gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"><AlertTriangle size={15} className="shrink-0 mt-0.5" />{error}</div>}
        {success && <div className="flex gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3"><CheckCircle2 size={15} className="shrink-0" />{success}</div>}

        <div className="flex gap-2">
          <button onClick={handleImport} disabled={saving || !json.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            匯入
          </button>
          <button onClick={() => setJson(EXAMPLE_JSON)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            載入範例 JSON
          </button>
        </div>
      </section>

      {/* Problem list */}
      <section className="space-y-3">
        <h2 className="font-bold text-white">題目列表（{problems.length} 道）</h2>
        {problems.length === 0 && (
          <p className="text-sm text-slate-600 text-center py-8">尚無題目</p>
        )}
        {problems.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{p.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {p.cases.length} 個測資 ・ 滿分 {p.cases.reduce((s,c)=>s+c.score,0)} ・ ID: {p.id}
              </div>
            </div>
            <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded">
              {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              刪除
            </button>
          </div>
        ))}
      </section>

      {/* JSON format guide */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-300 mb-3 text-sm">題目 JSON 格式說明</h3>
        <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap">{`{
  "id":           "唯一 ID（可選，省略自動產生）",
  "title":        "題目名稱",
  "description":  "題目描述",
  "inputFormat":  "輸入格式說明",
  "outputFormat": "輸出格式說明",
  "examples": [
    { "input": "...", "output": "...", "explanation": "選填" }
  ],
  "cases": [
    {
      "groupTitle":  "測資群組名稱",
      "caseTitle":   "測試案例 1",
      "input":       "測試輸入（每行一個 prompt 輸入）",
      "output":      "期望輸出",
      "score":       20,
      "visibility":  "public 或 hidden"
    }
  ]
}`}</pre>
      </section>
    </div>
  )
}
