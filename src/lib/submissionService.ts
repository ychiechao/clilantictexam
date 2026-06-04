// src/lib/submissionService.ts
import {
  collection, addDoc, doc, setDoc, getDoc, query,
  where, orderBy, getDocs, serverTimestamp, limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Submission, UserProblemStat } from './types'

export async function saveSubmission(sub: Omit<Submission, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'submissions'), {
    ...sub,
    submittedAt: Date.now(),
  })
  return ref.id
}

export async function updateUserProblemStat(stat: UserProblemStat) {
  const id  = `${stat.userId}_${stat.problemId}`
  const ref = doc(db, 'userProblemStats', id)
  const existing = await getDoc(ref)

  if (!existing.exists() || existing.data().bestScore < stat.bestScore) {
    await setDoc(ref, stat)
    return true // improved
  }
  // still update attempts & lastSubmitAt
  await setDoc(ref, {
    ...existing.data(),
    attempts:     (existing.data().attempts ?? 0) + 1,
    lastSubmitAt: stat.lastSubmitAt,
  })
  return false
}

export async function getUserSubmissions(userId: string, problemId: string) {
  const q = query(
    collection(db, 'submissions'),
    where('userId', '==', userId),
    where('problemId', '==', problemId),
    orderBy('submittedAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Submission, 'id'>) }))
}
