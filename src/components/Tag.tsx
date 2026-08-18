import './Tag.css'

export type TagTone = 'matched' | 'mismatch' | 'gap' | 'info' | 'neutral'
export type TagVariant = 'pill' | 'dot'

export function Tag({ label, tone, variant = 'pill' }: { label: string; tone: TagTone; variant?: TagVariant }) {
  if (variant === 'dot') {
    return (
      <span className={`tag-dot tag-dot--${tone}`}>
        <span className="tag-dot__marker" aria-hidden="true" />
        {label}
      </span>
    )
  }
  return <span className={`tag tag--${tone}`}>{label}</span>
}
