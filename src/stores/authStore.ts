// src/stores/authStore.ts
import { create } from 'zustand'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, provider } from '@/lib/firebase'
import type { User } from '@/lib/types'

interface AuthState {
  user:        User | null
  loading:     boolean
  initialized: boolean
  signIn:      () => Promise<void>
  signOut:     () => Promise<void>
  _init:       () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  loading:     false,
  initialized: false,

  signIn: async () => {
    set({ loading: true })
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      console.error('signIn error', e)
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null })
  },

  _init: () => {
    onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        set({ user: null, initialized: true })
        return
      }

      // Check / create user doc
      const userRef = doc(db, 'users', fbUser.uid)
      const snap    = await getDoc(userRef)

      // First user ever → admin
      const adminsSnap = await getDoc(doc(db, 'admins', 'list'))
      const adminList: string[] = adminsSnap.exists()
        ? (adminsSnap.data().uids ?? [])
        : []

      let isAdmin = adminList.includes(fbUser.uid)

      if (!snap.exists()) {
        // If very first user, make admin
        if (adminList.length === 0) {
          isAdmin = true
          await setDoc(doc(db, 'admins', 'list'), { uids: [fbUser.uid] })
        }
        await setDoc(userRef, {
          uid:         fbUser.uid,
          displayName: fbUser.displayName ?? '匿名',
          email:       fbUser.email ?? '',
          photoURL:    fbUser.photoURL ?? '',
          isAdmin,
          createdAt:   serverTimestamp(),
        })
      }

      const userData = snap.exists() ? snap.data() : {
        uid:         fbUser.uid,
        displayName: fbUser.displayName ?? '匿名',
        email:       fbUser.email ?? '',
        photoURL:    fbUser.photoURL ?? '',
        isAdmin,
      }

      set({
        user: {
          uid:         fbUser.uid,
          displayName: fbUser.displayName ?? userData.displayName,
          email:       fbUser.email ?? userData.email,
          photoURL:    fbUser.photoURL ?? userData.photoURL,
          isAdmin:     userData.isAdmin ?? isAdmin,
        },
        initialized: true,
      })
    })
  },
}))
