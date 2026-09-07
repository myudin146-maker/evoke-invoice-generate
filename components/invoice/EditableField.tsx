'use client'

import { useRef, useEffect, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface EditableFieldProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
  inputClassName?: string
  style?: CSSProperties
}

export default function EditableField({
  value,
  onChange,
  placeholder = 'Klik untuk mengedit...',
  multiline = false,
  className,
  inputClassName,
  style,
}: EditableFieldProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [value])

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      style={style}
      className={cn(
        'editable-field outline-none',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300',
        multiline ? 'whitespace-pre-wrap' : 'whitespace-nowrap overflow-hidden',
        inputClassName,
        className
      )}
    />
  )
}
