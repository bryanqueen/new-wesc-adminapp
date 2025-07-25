"use client"

import * as React from "react"
import { nanoid } from "nanoid"
import { BlockMenuDialog } from "./block-menu-dialog"
import { Block } from "./block"
import { Button } from "@/components/ui/button"
import { CoverImageUpload } from "./cover-image-upload"
import { toast } from "@/hooks/use-toast"

interface BlockData {
  id: string
  type: string
  content: string
  caption?: string
}

interface BlogEditorProps {
  initialBlog?: {
    title: string
    coverImage: string
    content: BlockData[]
  }
  onSave: (blog: { title: string; coverImage: string; content: BlockData[] }) => Promise<void>
}

export function BlogEditor({ initialBlog, onSave }: BlogEditorProps) {
  const [title, setTitle] = React.useState(initialBlog?.title || "")
  const [coverImage, setCoverImage] = React.useState(initialBlog?.coverImage || "")
  const [blocks, setBlocks] = React.useState<BlockData[]>(
    initialBlog?.content || [{ id: nanoid(), type: "paragraph", content: "" }],
  )
  const [activeBlock, setActiveBlock] = React.useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = React.useState(false)
  const [focusBlockId, setFocusBlockId] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const editorRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLDivElement>(null)
  const [shouldFocusTitleAtEnd, setShouldFocusTitleAtEnd] = React.useState(false)

  // Stabilize cursor for title after input
  const stabilizeTitleCursor = () => {
    if (!titleRef.current || document.activeElement !== titleRef.current) return
    const selection = window.getSelection()
    if (selection) {
      const range = document.createRange()
      const walker = document.createTreeWalker(titleRef.current, NodeFilter.SHOW_TEXT, null)
      let lastTextNode = null
      let node
      while ((node = walker.nextNode())) {
        lastTextNode = node
      }
      if (lastTextNode) {
        range.setStart(lastTextNode, lastTextNode.textContent?.length || 0)
        range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  // Handle title input and cursor stabilization
  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ""
    setTitle(newContent)
    setShouldFocusTitleAtEnd(true)
    setTimeout(stabilizeTitleCursor, 0)
  }

  // Cursor positioning for title when focused
  React.useEffect(() => {
    if (shouldFocusTitleAtEnd && titleRef.current) {
      requestAnimationFrame(() => {
        if (titleRef.current) {
          titleRef.current.focus()
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            const range = document.createRange()
            const textContent = titleRef.current.textContent
            if (textContent && textContent.trim()) {
              const walker = document.createTreeWalker(titleRef.current, NodeFilter.SHOW_TEXT, null)
              let lastTextNode = null
              let node
              while ((node = walker.nextNode())) {
                lastTextNode = node
              }
              if (lastTextNode) {
                range.setStart(lastTextNode, lastTextNode.textContent?.length || 0)
                range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0)
              } else {
                range.selectNodeContents(titleRef.current)
                range.collapse(false)
              }
            } else {
              range.selectNodeContents(titleRef.current)
              range.collapse(true)
            }
            selection.addRange(range)
          }
        }
      })
      setShouldFocusTitleAtEnd(false)
    }
  }, [shouldFocusTitleAtEnd])

  const handleCoverImageDelete = () => {
    setCoverImage("")
  }

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!activeBlock) return

      const shortcuts = [
        { key: "1", ctrlKey: true, altKey: true, type: "h1" },
        { key: "2", ctrlKey: true, altKey: true, type: "h2" },
        { key: "3", ctrlKey: true, altKey: true, type: "h3" },
        { key: "0", ctrlKey: true, altKey: true, type: "paragraph" },
        { key: "q", ctrlKey: true, altKey: true, type: "quote" },
        { key: "8", ctrlKey: true, altKey: true, type: "bullet-list" },
        { key: "9", ctrlKey: true, altKey: true, type: "numbered-list" },
      ]

      const shortcut = shortcuts.find(
        (s) => s.key === e.key.toLowerCase() && e.ctrlKey === s.ctrlKey && e.altKey === s.altKey,
      )

      if (shortcut) {
        e.preventDefault()
        setBlocks(blocks.map((block) => (block.id === activeBlock ? { ...block, type: shortcut.type } : block)))
        setTimeout(() => {
          const activeBlockElement = document.querySelector(`[data-block-id="${activeBlock}"]`)
          if (activeBlockElement) {
            (activeBlockElement as HTMLElement).focus()
          }
        }, 0)
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [activeBlock, blocks])

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const currentBlock = blocks.find((b) => b.id === blockId)
    if (!currentBlock) return

    if (e.key === "/") {
      e.preventDefault()
      setShowBlockMenu(true)
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const index = blocks.findIndex((b) => b.id === blockId)

      if (["bullet-list", "numbered-list"].includes(currentBlock.type)) {
        if (currentBlock.content === "") {
          setBlocks([
            ...blocks.slice(0, index),
            { ...currentBlock, type: "paragraph", content: "" },
            ...blocks.slice(index + 1),
          ])
          setActiveBlock(blockId)
          setFocusBlockId(blockId)
        } else {
          const newBlock = { id: nanoid(), type: currentBlock.type, content: "" }
          setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)])
          setActiveBlock(newBlock.id)
          setFocusBlockId(newBlock.id)
        }
      } else if (["divider", "image"].includes(currentBlock.type)) {
        const newBlock = { id: nanoid(), type: "paragraph", content: "" }
        setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)])
        setActiveBlock(newBlock.id)
        setFocusBlockId(newBlock.id)
      } else {
        const newBlock = { id: nanoid(), type: "paragraph", content: "" }
        setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)])
        setActiveBlock(newBlock.id)
        setFocusBlockId(newBlock.id)
      }
    } else if (e.key === "Backspace") {
      const index = blocks.findIndex((b) => b.id === blockId)

      if (["divider", "image"].includes(currentBlock.type)) {
        e.preventDefault()
        setBlocks([
          ...blocks.slice(0, index),
          { ...currentBlock, type: "paragraph", content: "", caption: "" },
          ...blocks.slice(index + 1),
        ])
        setActiveBlock(blockId)
        setFocusBlockId(blockId)
      } else if (currentBlock.content === "") {
        e.preventDefault()
        if (blocks.length === 1) return
        if (index === 0) return

        const newBlocks = blocks.filter((b) => b.id !== blockId)
        setBlocks(newBlocks)
        const prevBlockId = blocks[index - 1].id
        setActiveBlock(prevBlockId)
        setFocusBlockId(prevBlockId)
      }
    }
  }

  const handleBlockChange = (id: string, content: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const handleCaptionChange = (id: string, caption: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, caption } : block)))
  }

  const handleBlockTypeChange = (id: string, type: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, type } : block)))
    setShowBlockMenu(false)
    setTimeout(() => {
      const activeBlockElement = document.querySelector(`[data-block-id="${id}"]`)
      if (activeBlockElement) {
        (activeBlockElement as HTMLElement).focus()
      }
    }, 0)
  }

  const handleDuplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === id)
    if (!blockToDuplicate) return

    const index = blocks.findIndex((b) => b.id === id)
    const newBlock = { ...blockToDuplicate, id: nanoid() }
    setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)])
  }

  const handleDeleteBlock = (id: string) => {
    if (blocks.length === 1) return
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  const getPlaceholder = (type: string) => {
    switch (type) {
      case "h1":
        return "Heading 1"
      case "h2":
        return "Heading 2"
      case "h3":
        return "Heading 3"
      case "quote":
        return "Quote"
      case "bullet-list":
        return " List item"
      case "numbered-list":
        return " List item"
      default:
        return "Type '/' for commands"
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
        content: blocks.filter((block) => block.content.trim() !== "" || ["divider", "image"].includes(block.type)),
      })
    } catch (error) {
      console.error("Error saving blog:", error)
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
      <div className="mb-8 space-y-6">
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

        <CoverImageUpload
          onUpload={setCoverImage}
          onDelete={handleCoverImageDelete}
          value={coverImage}
          className="w-full h-[300px]"
        />
      </div>

      <div className="relative">
        {(() => {
          const groupedBlocks = []
          let i = 0
          while (i < blocks.length) {
            const block = blocks[i]
            if (block.type === "bullet-list" || block.type === "numbered-list") {
              const listType = block.type
              const listBlocks = []
              let j = i
              while (j < blocks.length && blocks[j].type === listType) {
                listBlocks.push(blocks[j])
                j++
              }
              groupedBlocks.push(
                listType === "bullet-list" ? (
                  <ul className="list-disc my-2 ml-4" key={blocks[i].id + "-ul"}>
                    {listBlocks.map((b) => (
                      <Block
                        key={b.id}
                        id={b.id}
                        type={b.type}
                        content={b.content}
                        isActive={activeBlock === b.id}
                        shouldFocusAtEnd={focusBlockId === b.id}
                        placeholder={getPlaceholder(b.type)}
                        onChange={(content) => handleBlockChange(b.id, content)}
                        onTypeChange={(type) => handleBlockTypeChange(b.id, type)}
                        onKeyDown={(e) => handleKeyDown(e, b.id)}
                        onFocus={() => setActiveBlock(b.id)}
                        onDuplicate={handleDuplicateBlock}
                        onDelete={handleDeleteBlock}
                        caption={b.caption}
                        onCaptionChange={(caption) => handleCaptionChange(b.id, caption)}
                      />
                    ))}
                  </ul>
                ) : (
                  <ol className="list-decimal my-2 ml-4" key={blocks[i].id + "-ol"}>
                    {listBlocks.map((b) => (
                      <Block
                        key={b.id}
                        id={b.id}
                        type={b.type}
                        content={b.content}
                        isActive={activeBlock === b.id}
                        shouldFocusAtEnd={focusBlockId === b.id}
                        placeholder={getPlaceholder(b.type)}
                        onChange={(content) => handleBlockChange(b.id, content)}
                        onTypeChange={(type) => handleBlockTypeChange(b.id, type)}
                        onKeyDown={(e) => handleKeyDown(e, b.id)}
                        onFocus={() => setActiveBlock(b.id)}
                        onDuplicate={handleDuplicateBlock}
                        onDelete={handleDeleteBlock}
                        caption={b.caption}
                        onCaptionChange={(caption) => handleCaptionChange(b.id, caption)}
                      />
                    ))}
                  </ol>
                ),
              )
              i = j
            } else {
              groupedBlocks.push(
                <Block
                  key={block.id}
                  id={block.id}
                  type={block.type}
                  content={block.content}
                  isActive={activeBlock === block.id}
                  shouldFocusAtEnd={focusBlockId === block.id}
                  placeholder={getPlaceholder(block.type)}
                  onChange={(content) => handleBlockChange(block.id, content)}
                  onTypeChange={(type) => handleBlockTypeChange(block.id, type)}
                  onKeyDown={(e) => handleKeyDown(e, block.id)}
                  onFocus={() => setActiveBlock(block.id)}
                  onDuplicate={handleDuplicateBlock}
                  onDelete={handleDeleteBlock}
                  caption={block.caption}
                  onCaptionChange={(caption) => handleCaptionChange(block.id, caption)}
                />,
              )
              i++
            }
          }

          if (focusBlockId) {
            setTimeout(() => setFocusBlockId(null), 0)
          }

          return groupedBlocks
        })()}
      </div>

      <BlockMenuDialog open={showBlockMenu} onClose={() => setShowBlockMenu(false)} onSelect={(type) => handleBlockTypeChange(activeBlock || "", type)} />

      <div className="py-4">
        <Button onClick={handleSave} className="bg-primary text-white hover:bg-primary/90" disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⚪</span>
            </>
          ) : (
            "Save Blog"
          )}
        </Button>
      </div>
    </div>
  )
}