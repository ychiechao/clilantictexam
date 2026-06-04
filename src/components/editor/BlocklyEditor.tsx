// src/components/editor/BlocklyEditor.tsx
import { useEffect, useRef, useCallback } from 'react'

interface Props {
  storageKey: string
  onCodeChange?: (js: string, xml: string) => void
}

let blocklyLoaded = false

const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="輸入輸出" colour="#5C81A6">
    <block type="text_prompt_ext">
      <value name="TEXT"><shadow type="text"><field name="TEXT">請輸入</field></shadow></value>
    </block>
    <block type="text_print"></block>
  </category>
  <category name="變數" colour="#A65C81" custom="VARIABLE"></category>
  <category name="邏輯" colour="#5C68A6">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="迴圈" colour="#5CA65C">
    <block type="controls_repeat_ext">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="controls_forEach"></block>
    <block type="controls_flow_statements"></block>
  </category>
  <category name="數學" colour="#5C68A6">
    <block type="math_number"><field name="NUM">0</field></block>
    <block type="math_arithmetic"></block>
    <block type="math_modulo"></block>
    <block type="math_round"></block>
    <block type="math_number_property"></block>
    <block type="math_on_list"></block>
    <block type="math_random_int">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
    </block>
  </category>
  <category name="文字" colour="#5CA6A6">
    <block type="text"></block>
    <block type="text_join"></block>
    <block type="text_append"></block>
    <block type="text_length"></block>
    <block type="text_isEmpty"></block>
    <block type="text_indexOf"></block>
    <block type="text_charAt"></block>
    <block type="text_getSubstring"></block>
    <block type="text_changeCase"></block>
    <block type="text_trim"></block>
  </category>
  <category name="清單" colour="#745CA6">
    <block type="lists_create_empty"></block>
    <block type="lists_create_with"></block>
    <block type="lists_repeat">
      <value name="NUM"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
    </block>
    <block type="lists_length"></block>
    <block type="lists_isEmpty"></block>
    <block type="lists_indexOf"></block>
    <block type="lists_getIndex"></block>
    <block type="lists_setIndex"></block>
    <block type="lists_getSublist"></block>
    <block type="lists_split"></block>
    <block type="lists_sort"></block>
  </category>
  <category name="函式" colour="#995BA5" custom="PROCEDURE"></category>
</xml>
`

export default function BlocklyEditor({ storageKey, onCodeChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<any>(null)

  const emitCode = useCallback((B: any, jsGen: any, workspace: any) => {
    try {
      const js  = jsGen.workspaceToCode(workspace) as string
      const dom = B.Xml.workspaceToDom(workspace)
      const xml = B.Xml.domToText(dom)
      localStorage.setItem(`blockly_xml_${storageKey}`, xml)
      onCodeChange?.(js, xml)
    } catch (e) {
      console.warn('emitCode error', e)
    }
  }, [storageKey, onCodeChange])

  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true

    ;(async () => {
      // Load Blockly modules
      const [B, jsModule, zhTW] = await Promise.all([
        import('blockly'),
        import('blockly/javascript'),
        import('blockly/msg/zh-hant'),
      ])

      if (!mounted || !containerRef.current) return

      // Set locale (keys only, skip 'default' export key)
      const locale: Record<string,string> = {}
      for (const [k, v] of Object.entries(zhTW)) {
        if (k !== 'default' && typeof v === 'string') locale[k] = v
      }
      B.setLocale(locale)

      const jsGen = (jsModule as any).javascriptGenerator

      const workspace = B.inject(containerRef.current, {
        toolbox: TOOLBOX_XML,
        grid:    { spacing: 20, length: 3, colour: '#1e293b', snap: true },
        zoom:    { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
        trashcan: true,
        scrollbars: true,
        sounds: false,
        renderer: 'zelos',
        move: { scrollbars: true, drag: true, wheel: true },
      })

      workspaceRef.current = workspace

      // Restore saved XML
      const saved = localStorage.getItem(`blockly_xml_${storageKey}`)
      if (saved) {
        try {
          const parser = new DOMParser()
          const dom = parser.parseFromString(saved, 'text/xml').documentElement
          B.Xml.domToWorkspace(dom as any, workspace)
        } catch (_) { /* ignore corrupt state */ }
      }

      workspace.addChangeListener(() => emitCode(B, jsGen, workspace))
      emitCode(B, jsGen, workspace)
    })()

    return () => {
      mounted = false
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 400 }} />
  )
}
