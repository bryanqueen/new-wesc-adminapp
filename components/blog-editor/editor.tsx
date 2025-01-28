'use client'

import * as React from 'react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { BlockMenu } from './block-menu'
import { Block } from './block'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './image-upload'
import { Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface BlockData {
  id: string
  type: string
  content: string
}

interface BlogEditorProps {
  initialBlog?: {
    title: string
    coverImage: string
    content: BlockData[]
  }
  onSave: (blog: { title: string, coverImage: string, content: BlockData[] }) => Promise<void>
}

export function BlogEditor({ initialBlog, onSave }: BlogEditorProps) {
  const [title, setTitle] = React.useState(initialBlog?.title || '')
  const [coverImage, setCoverImage] = React.useState(initialBlog?.coverImage || '')
  const [blocks, setBlocks] = React.useState<BlockData[]>(
    initialBlog?.content || [{ id: nanoid(), type: 'paragraph', content: '' }]
  )
  const [activeBlock, setActiveBlock] = React.useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = React.useState(false)
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 })
  const [isSaving, setIsSaving] = React.useState(false)
  const editorRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLDivElement>(null)
  const [titleSelectionPosition, setTitleSelectionPosition] = React.useState<number | null>(null)

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    const selection = window.getSelection()
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const position = range.startOffset
      setTitleSelectionPosition(position)
    }
    
    setTitle(newContent)
  }

  React.useEffect(() => {
    if (titleSelectionPosition !== null && titleRef.current) {
      const selection = window.getSelection()
      const range = document.createRange()
      const textNode = titleRef.current.firstChild || titleRef.current

      try {
        range.setStart(textNode, titleSelectionPosition)
        range.setEnd(textNode, titleSelectionPosition)
        selection?.removeAllRanges()
        selection?.addRange(range)
        setTitleSelectionPosition(null)
      } catch (e) {
        console.error('Error setting cursor position:', e)
      }
    }
  }, [title, titleSelectionPosition])


  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const currentBlock = blocks.find(b => b.id === blockId)
    if (!currentBlock) return

    if (e.key === '/') {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      setMenuPosition({
        top: rect.top + window.scrollY,
        left: rect.left
      })
      setShowBlockMenu(true)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newBlock = { id: nanoid(), type: 'paragraph', content: '' }
      const index = blocks.findIndex(b => b.id === blockId)
      setBlocks([
        ...blocks.slice(0, index + 1),
        newBlock,
        ...blocks.slice(index + 1)
      ])
      setActiveBlock(newBlock.id)
    } else if (e.key === 'Backspace' && currentBlock.content === '') {
      e.preventDefault()
      if (blocks.length === 1) return

      const index = blocks.findIndex(b => b.id === blockId)
      if (index === 0) return

      const newBlocks = blocks.filter(b => b.id !== blockId)
      setBlocks(newBlocks)
      setActiveBlock(blocks[index - 1].id)
    }
  }

  const handleBlockChange = (id: string, content: string) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content } : block
    ))
  }

  const handleBlockTypeChange = (type: string) => {
    if (!activeBlock) return
    setBlocks(blocks.map(block =>
      block.id === activeBlock ? { ...block, type } : block
    ))
    setShowBlockMenu(false)
  }

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'h1': return 'Heading 1'
      case 'h2': return 'Heading 2'
      case 'h3': return 'Heading 3'
      case 'quote': return 'Quote'
      case 'bullet-list': return '• List item'
      case 'numbered-list': return '1. List item'
      default: return "Type '/' for commands"
    }
  }

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please add a title for your blog",
        variant: "destructive",
      })
      return
    }

    if (!coverImage) {
      toast({
        title: "Error",
        description: "Please add a cover image",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await onSave({
        title,
        coverImage,
        content: blocks.filter(block => block.content.trim() !== '') // Remove empty blocks
      })
    } catch (error) {
      console.error('Error saving blog:', error)
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="max-w-4xl mx-auto" ref={editorRef}>
      <div className="mb-8 space-y-4">
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="text-5xl font-bold px-4 py-2 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          data-placeholder="Blog Title"
          onInput={handleTitleInput}
          spellCheck="false"
        >
          {title}
        </div>
        <ImageUpload
          onUpload={setCoverImage}
          value={coverImage}
          className="w-full h-[300px]"
        />
      </div>

      <div className="relative">
        {blocks.map(block => (
          <Block
            key={block.id}
            id={block.id}
            type={block.type}
            content={block.content}
            isActive={activeBlock === block.id}
            placeholder={getPlaceholder(block.type)}
            onChange={(content) => handleBlockChange(block.id, content)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            onFocus={() => setActiveBlock(block.id)}
          />
        ))}
      </div>

      <BlockMenu
        open={showBlockMenu}
        onClose={() => setShowBlockMenu(false)}
        onSelect={handleBlockTypeChange}
        position={menuPosition}
      />

      <div className="py-4">
        <Button
          onClick={handleSave}
          className="bg-primary text-white hover:bg-primary/90"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⚪</span>
            </>
          ) : (
            'Save Blog'
          )}
        </Button>
      </div>
    </div>
  )
}

