import type { ReactNode } from 'react'
import './Callout.css'

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="callout">
      <div className="callout__title">{title}</div>
      <div className="callout__body">{children}</div>
    </div>
  )
}
