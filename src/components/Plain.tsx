import { useState } from 'react'
import { GLOSSARY, splitGlossary } from '../lib/glossary'

// Shows text with tech words underlined; tap one to see what it means in plain English.
export function Term({ word, term }: { word: string; term: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        className="cursor-help underline decoration-ink-soft decoration-dotted decoration-2 underline-offset-4 hover:decoration-ink"
      >
        {word}
      </button>
      {open && (
        <span role="tooltip" className="pop absolute bottom-full left-0 z-40 mb-2 block w-64 rounded-xl bg-card p-3 text-left text-xs leading-relaxed font-normal text-ink normal-case">
          <strong className="block text-sm">{term}</strong>
          {GLOSSARY[term]}
        </span>
      )}
    </span>
  )
}

export default function Plain({ text }: { text: string }) {
  return (
    <>
      {splitGlossary(text).map((p, i) => (p.term ? <Term key={i} word={p.text} term={p.term} /> : <span key={i}>{p.text}</span>))}
    </>
  )
}
