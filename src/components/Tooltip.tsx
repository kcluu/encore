import './Tooltip.css'

import { useState, type MouseEvent, type ReactNode } from 'react'

interface TooltipProps {
  message: string
  children: ReactNode
  className?: string
}

export const Tooltip = ({ message, children, className }: TooltipProps) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    setPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className={className} onMouseMove={handleMove} onMouseLeave={() => setPos(null)}>
      {children}

      {pos && (
        <span className="cursor-tooltip" style={{ left: pos.x, top: pos.y }}>
          {message}
        </span>
      )}
    </div>
  )
}
