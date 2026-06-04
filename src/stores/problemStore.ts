// src/stores/problemStore.ts
import { create } from 'zustand'
import {
  collection, getDocs, doc, setDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Problem } from '@/lib/types'

interface ProblemState {
  problems:     Problem[]
  loading:      boolean
  fetchProblems: () => Promise<void>
  importProblem: (p: Omit<Problem, 'id'> & { id?: string }) => Promise<string>
  deleteProblem: (id: string) => Promise<void>
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  loading:  false,

  fetchProblems: async () => {
    set({ loading: true })
    try {
      const q    = query(collection(db, 'problems'), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      const problems: Problem[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Problem, 'id'>),
      }))
      set({ problems })
    } catch (e) {
      // fallback without order
      try {
        const snap = await getDocs(collection(db, 'problems'))
        const problems: Problem[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Problem, 'id'>),
        }))
        set({ problems })
      } catch (err) {
        console.error('fetchProblems error', err)
      }
    } finally {
      set({ loading: false })
    }
  },

  importProblem: async (p) => {
    const id  = p.id ?? `prob_${Date.now()}`
    const ref = doc(db, 'problems', id)
    const existing = get().problems
    const order = p.order ?? existing.length
    await setDoc(ref, {
      ...p,
      id,
      order,
      createdAt: Date.now(),
    })
    await get().fetchProblems()
    return id
  },

  deleteProblem: async (id) => {
    await deleteDoc(doc(db, 'problems', id))
    set(s => ({ problems: s.problems.filter(p => p.id !== id) }))
  },
}))
