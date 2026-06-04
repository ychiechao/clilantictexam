// src/pages/LeaderboardPage.tsx
import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/lib/leaderboardService'
import type { LeaderboardEntry } from '@/lib/types'
import { Trophy, Loader2, Medal } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard(100)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const medalColor = (rank: number) =>
    rank === 1 ? 'text-yellow-400' :
    rank === 2 ? 'text-slate-300' :
    rank === 3 ? 'text-amber-600' : 'text-slate-600'

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy size={24} className="text-yellow-400" />
        <h1 className="text-2xl font-black text-white">排行榜</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">尚無排行紀錄</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">選手</div>
            <div className="col-span-2 text-right">總分</div>
            <div className="col-span-2 text-right">解題</div>
            <div className="col-span-2 text-right hidden sm:block">提交</div>
          </div>

          {entries.map((e, i) => {
            const rank = i + 1
            const isMe = user?.uid === e.userId
            return (
              <div key={e.userId}
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-xl border transition-colors
                  ${isMe
                    ? 'bg-brand-950 border-brand-700'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                <div className={`col-span-1 font-bold text-sm ${medalColor(rank)}`}>
                  {rank <= 3 ? <Medal size={18} /> : rank}
                </div>
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  {e.userPhoto && (
                    <img src={e.userPhoto} alt="" className="w-7 h-7 rounded-full shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {e.userName}
                      {isMe && <span className="ml-1 text-xs text-brand-400">（我）</span>}
                    </div>
                    {e.lastSolvedAt > 0 && (
                      <div className="text-xs text-slate-600">
                        {new Date(e.lastSolvedAt).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`col-span-2 text-right font-black text-lg ${
                  e.totalScore > 0 ? 'text-brand-400' : 'text-slate-600'}`}>
                  {e.totalScore}
                </div>
                <div className="col-span-2 text-right text-sm text-slate-400">
                  {e.solvedCount} 題
                </div>
                <div className="col-span-2 text-right text-sm text-slate-500 hidden sm:block">
                  {e.submissionCount} 次
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
