// src/components/editor/CodeTabs.tsx
import { useState } from 'react'

interface Props {
  js:  string
  xml: string
}

export default function CodeTabs({ js, xml }: Props) {
  const [tab, setTab] = useState<'js' | 'xml'>('js')

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-800">
        {(['js', 'xml'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono font-semibold transition-colors
              ${tab === t
                ? 'text-brand-400 border-b-2 border-brand-500 -mb-px'
                : 'text-slate-500 hover:text-slate-300'}`}>
            {t === 'js' ? 'JavaScript' : 'XML'}
          </button>
        ))}
      </div>
      <pre className="flex-1 overflow-auto p-3 text-xs font-mono text-slate-300 bg-slate-950 scrollbar-thin whitespace-pre-wrap break-all">
        {tab === 'js' ? (js || '// 在上方拖曳積木以產生程式碼') : (xml || '<!-- 尚無積木 -->')}
      </pre>
    </div>
  )
}
