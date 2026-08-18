import { useEffect } from 'react'
import type { ReactNode } from 'react'
import './SidePanel.css'

export function SidePanel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="side-panel-overlay" onClick={onClose}>
      <aside className="side-panel" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="side-panel__header">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="side-panel__subtitle">{subtitle}</div>}
          </div>
          <button type="button" className="side-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="side-panel__body">{children}</div>
      </aside>
    </div>
  )
}
