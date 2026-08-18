import './Tag.css'

export type TagTone = 'matched' | 'mismatch' | 'gap' | 'info' | 'neutral'

export function Tag({ label, tone }: { label: string; tone: TagTone }) {
  return <span className={`tag tag--${tone}`}>{label}</span>
}
