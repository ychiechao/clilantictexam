// src/lib/leaderboardService.ts
import {
  doc, getDoc, setDoc, collection, getDocs,
  query, orderBy, limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { LeaderboardEntry, UserProblemStat } from './types'

/**
 * Re-computes a user's leaderboard entry from their userProblemStats
 * and writes it to the leaderboard collection.
 */
export async function updateLeaderboard(userId: string, userName: string, userPhoto?: string) {
  // Get all problem stats for this user
  const statsSnap = await getDocs(
    query(collection(db, 'userProblemStats'), /* no user filter needed — client query */)
  )

  let totalScore   = 0
  let solvedCount  = 0
  let lastSolvedAt = 0
  let submissions  = 0

  statsSnap.docs
    .filter(d => d.data().userId === userId)
    .forEach(d => {
      const s = d.data() as UserProblemStat
      totalScore  += s.bestScore
      submissions += s.attempts
      if (s.bestScore > 0) {
        solvedCount++
        if ((s.solvedAt ?? 0) > lastSolvedAt) lastSolvedAt = s.solvedAt ?? 0
      }
    })

  const entry: LeaderboardEntry = {
    userId, userName, userPhoto,
    totalScore, solvedCount, lastSolvedAt, submissionCount: submissions,
  }

  await setDoc(doc(db, 'leaderboards', userId), entry)
}

export async function getLeaderboard(n = 50): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'leaderboards'),
    orderBy('totalScore', 'desc'),
    limit(n)
  )
  const snap = await getDocs(q)
  const entries = snap.docs.map(d => d.data() as LeaderboardEntry)

  // Sort: score desc, lastSolvedAt asc, submissionCount asc
  return entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
    if (a.lastSolvedAt !== b.lastSolvedAt) return a.lastSolvedAt - b.lastSolvedAt
    return a.submissionCount - b.submissionCount
  })
}
