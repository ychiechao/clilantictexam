// src/components/Layout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LogIn, LogOut, Trophy, Code2, ShieldCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, signIn, signOut, loading } = useAuthStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = [
    { to: '/', label: '題目列表', icon: <Code2 size={15} /> },
    { to: '/leaderboard', label: '排行榜', icon: <Trophy size={15} /> },
    ...(user?.isAdmin ? [{ to: '/admin', label: '管理', icon: <ShieldCheck size={15} /> }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">宜</div>
            <span className="font-bold text-white hidden sm:block text-sm leading-tight">
              宜蘭縣資訊科技<br className="hidden lg:block" />
              <span className="hidden lg:inline">創意實作競賽</span>
            </span>
            <span className="font-bold text-white sm:hidden text-sm">宜蘭ICT競賽</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === n.to
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                {n.icon}{n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* User info */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-2 ring-brand-600" />
                )}
                <span className="text-sm text-slate-300 max-w-[120px] truncate">{user.displayName}</span>
                {user.isAdmin && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">管理員</span>
                )}
                <button onClick={signOut}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded">
                  <LogOut size={13} />登出
                </button>
              </div>
            ) : (
              <button onClick={signIn} disabled={loading}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                <LogIn size={14} />Google 登入
              </button>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 flex flex-col gap-2 animate-fade-in">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  ${location.pathname === n.to ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                {n.icon}{n.label}
              </Link>
            ))}
            <div className="border-t border-slate-800 pt-2 mt-1">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />}
                    <span className="text-sm text-slate-300">{user.displayName}</span>
                  </div>
                  <button onClick={() => { signOut(); setMenuOpen(false) }}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1">
                    <LogOut size={13} />登出
                  </button>
                </div>
              ) : (
                <button onClick={() => { signIn(); setMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">
                  <LogIn size={14} />Google 登入
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-3 text-center text-xs text-slate-600">
        宜蘭縣資訊科技創意實作競賽系統 ｜ 前端計分版（練習用途）
      </footer>
    </div>
  )
}
