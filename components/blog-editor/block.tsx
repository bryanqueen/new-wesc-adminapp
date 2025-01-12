'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ImageUpload } from './image-upload'

interface BlockProps {
  id: string
  type: string
  content: string
  isActive: boolean
  placeholder?: string
  onChange: (content: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
}

export function Block({
  id,
  type,
  content,
  isActive,
  placeholder,
  onChange,
  onKeyDown,
  onFocus,
}: BlockProps) {
  const blockRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isActive && blockRef.current) {
      blockRef.current.focus()
    }
  }, [isActive])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    onChange(newContent)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  if (type === 'image') {
    return (
      <div className="my-4">
        <ImageUpload
          onUpload={onChange}
          value={content}
          className="w-full h-[300px]"
        />
      </div>
    )
  }

  if (type === 'divider') {
    return <hr className="my-4 border-t border-gray-200" />
  }

  const blockStyles = {
    h1: 'text-4xl font-bold mb-4',
    h2: 'text-3xl font-bold mb-3',
    h3: 'text-2xl font-bold mb-2',
    quote: 'border-l-4 border-gray-300 pl-4 italic',
    'bullet-list': 'list-disc list-inside',
    'numbered-list': 'list-decimal list-inside',
    paragraph: ''
  }[type]

  return (
    <div
      ref={blockRef}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        'min-h-[1.5em] px-4 py-1 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400',
        blockStyles,
        isActive && 'ring-0'
      )}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      dir="ltr"
    >
      {content}
    </div>
  )
}

