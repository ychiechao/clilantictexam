// src/pages/ProblemPage.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProblemStore } from '@/stores/problemStore'
import { ArrowLeft, Loader2, GripVertical } from 'lucide-react'
import ProblemPanel from '@/components/editor/ProblemPanel'
import BlocklyEditor from '@/components/editor/BlocklyEditor'
import RightPanel from '@/components/editor/RightPanel'

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>()
  const { problems, fetchProblems, loading } = useProblemStore()
  const problem = problems.find(p => p.id === id)

  const [js, setJs]   = useState('')
  const [xml, setXml] = useState('')

  // Resizable panels (left = problem desc, mid = blockly, right = grade)
  const [leftW,  setLeftW]  = useState(280) // px
  const [rightW, setRightW] = useState(320) // px
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (problems.length === 0) fetchProblems()
  }, [])

  const handleCodeChange = useCallback((newJs: string, newXml: string) => {
    setJs(newJs)
    setXml(newXml)
  }, [])

  // Drag divider
  const startDrag = (which: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startVal = which === 'left' ? leftW : rightW

    const onMove = (me: MouseEvent) => {
      const delta = me.clientX - startX
      if (which === 'left') {
        setLeftW(Math.max(200, Math.min(420, startVal + delta)))
      } else {
        setRightW(Math.max(240, Math.min(480, startVal - delta)))
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (loading || !problem) {
    return (
      <div className="flex-1 flex items-center justify-center">
        {loading
          ? <Loader2 size={32} className="animate-spin text-brand-500" />
          : <div className="text-center text-slate-500">
              <p className="mb-4">找不到題目</p>
              <Link to="/" className="text-brand-400 hover:underline text-sm">← 返回列表</Link>
            </div>}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px - 40px)' }}>
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900 shrink-0">
        <Link to="/" className="text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <span className="text-sm font-semibold text-white truncate">{problem.title}</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>滿分 {problem.cases.reduce((s,c) => s+c.score,0)} 分</span>
          <span>・</span>
          <span>{problem.cases.length} 個測資</span>
        </div>
      </div>

      {/* 3-pane layout — hidden on mobile (show stacked) */}
      {/* Desktop: 3 columns with drag dividers */}
      <div ref={containerRef} className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: Problem description */}
        <div style={{ width: leftW, minWidth: 200 }} className="flex flex-col border-r border-slate-800 overflow-hidden">
          <ProblemPanel problem={problem} />
        </div>

        {/* Divider L */}
        <div
          onMouseDown={e => startDrag('left', e)}
          className="w-1 cursor-col-resize hover:bg-brand-700 transition-colors bg-slate-800 flex items-center justify-center group shrink-0">
          <GripVertical size={12} className="text-slate-600 group-hover:text-brand-400" />
        </div>

        {/* Middle: Blockly */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <BlocklyEditor storageKey={id!} onCodeChange={handleCodeChange} />
          </div>
        </div>

        {/* Divider R */}
        <div
          onMouseDown={e => startDrag('right', e)}
          className="w-1 cursor-col-resize hover:bg-brand-700 transition-colors bg-slate-800 flex items-center justify-center group shrink-0">
          <GripVertical size={12} className="text-slate-600 group-hover:text-brand-400" />
        </div>

        {/* Right: Grade/test/history */}
        <div style={{ width: rightW, minWidth: 240 }} className="flex flex-col border-l border-slate-800 overflow-hidden">
          <RightPanel problem={problem} js={js} xml={xml} />
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="md:hidden flex flex-col flex-1 overflow-auto">
        <div className="border-b border-slate-800" style={{ height: 300 }}>
          <ProblemPanel problem={problem} />
        </div>
        <div style={{ height: 400 }}>
          <BlocklyEditor storageKey={id!} onCodeChange={handleCodeChange} />
        </div>
        <div style={{ minHeight: 400 }}>
          <RightPanel problem={problem} js={js} xml={xml} />
        </div>
      </div>
    </div>
  )
}
