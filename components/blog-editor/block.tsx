"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "./image-upload"
import { ImageOptions } from "./image-options"
import { CropImageDialog } from "./crop-image-dialog"

interface BlockProps {
  id: string
  type: string
  content: string
  isActive: boolean
  placeholder?: string
  onChange: (content: string) => void
  onTypeChange?: (type: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  shouldFocusAtEnd?: boolean
  caption?: string
  onCaptionChange?: (caption: string) => void
}

export function Block({
  id,
  type,
  content,
  isActive,
  placeholder,
  onChange,
  onTypeChange,
  onKeyDown,
  onFocus,
  onDuplicate,
  onDelete,
  shouldFocusAtEnd,
  caption,
  onCaptionChange,
}: BlockProps) {
  const divRef = React.useRef<HTMLDivElement>(null)
  const liRef = React.useRef<HTMLLIElement>(null)
  const captionRef = React.useRef<HTMLDivElement>(null)
  const [isInitialFocus, setIsInitialFocus] = React.useState(false)
  const [showImageOptions, setShowImageOptions] = React.useState(false)
  const [showCropDialog, setShowCropDialog] = React.useState(false)
  const [showCaption, setShowCaption] = React.useState(!!caption)

  // Focus block when it becomes active
  React.useEffect(() => {
    if (isActive && !isInitialFocus) {
      const el = type === "bullet-list" || type === "numbered-list" ? liRef.current : divRef.current
      if (el && typeof el.focus === "function") {
        el.focus()
        setIsInitialFocus(true)
      }
    }
    if (!isActive) {
      setIsInitialFocus(false)
    }
  }, [isActive, type, isInitialFocus])

  // Proper cursor positioning for text blocks
  React.useEffect(() => {
    if (isActive && shouldFocusAtEnd) {
      const el = type === "bullet-list" || type === "numbered-list" ? liRef.current : divRef.current
      if (el) {
        requestAnimationFrame(() => {
          el.focus()
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            const range = document.createRange()

            if (el.textContent && el.textContent.trim()) {
              const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
              let lastTextNode = null
              let node
              while ((node = walker.nextNode())) {
                lastTextNode = node
              }
              if (lastTextNode) {
                range.setStart(lastTextNode, lastTextNode.textContent?.length || 0)
                range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0)
              } else {
                range.selectNodeContents(el)
                range.collapse(false)
              }
            } else {
              range.selectNodeContents(el)
              range.collapse(true)
            }

            selection.addRange(range)
          }
        })
      }
    }
  }, [shouldFocusAtEnd, isActive, type])

  // Cursor positioning for caption when shown
  React.useEffect(() => {
    if (showCaption && captionRef.current) {
      requestAnimationFrame(() => {
        if (captionRef.current) {
          captionRef.current.focus()
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            const range = document.createRange()
            const textContent = captionRef.current.textContent
            if (textContent && textContent.trim()) {
              const walker = document.createTreeWalker(captionRef.current, NodeFilter.SHOW_TEXT, null)
              let lastTextNode = null
              let node
              while ((node = walker.nextNode())) {
                lastTextNode = node
              }
              if (lastTextNode) {
                range.setStart(lastTextNode, lastTextNode.textContent?.length || 0)
                range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0)
              } else {
                range.selectNodeContents(captionRef.current)
                range.collapse(false)
              }
            } else {
              range.selectNodeContents(captionRef.current)
              range.collapse(true)
            }
            selection.addRange(range)
          }
        }
      })
    }
  }, [showCaption])

  // Stabilize cursor after input for text blocks
  const stabilizeCursor = () => {
    const el = type === "bullet-list" || type === "numbered-list" ? liRef.current : divRef.current
    if (el && document.activeElement === el) {
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
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
  }

  // Stabilize cursor after input for caption
  const stabilizeCaptionCursor = () => {
    if (captionRef.current && document.activeElement === captionRef.current) {
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        const walker = document.createTreeWalker(captionRef.current, NodeFilter.SHOW_TEXT, null)
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
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement | HTMLLIElement>) => {
    const newContent = e.currentTarget.textContent || ""
    onChange(newContent)
    setTimeout(stabilizeCursor, 0)
  }

  const handleCaptionInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newCaption = e.currentTarget.textContent || ""
    onCaptionChange?.(newCaption)
    setTimeout(stabilizeCaptionCursor, 0)
  }

  const handleCaptionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onKeyDown(e)
    } else if (e.key === "Backspace" && (!captionRef.current?.textContent || captionRef.current?.textContent === "")) {
      e.preventDefault()
      setShowCaption(false)
      onCaptionChange?.("")
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)

      const inputEvent = new Event("input", { bubbles: true })
      e.currentTarget.dispatchEvent(inputEvent)
    }
  }

  const handleImageReplace = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const { url } = await response.json()
          onChange(url)
        } catch (error) {
          console.error("Error replacing image:", error)
        }
      }
    }
    input.click()
  }

  const handleAddCaption = () => {
    setShowCaption(true)
    setTimeout(() => {
      captionRef.current?.focus()
    }, 0)
  }

  const handleCropImage = () => {
    setShowCropDialog(true)
  }

  const handleCropConfirm = (croppedImageUrl: string) => {
    onChange(croppedImageUrl)
  }

  const handleImageDelete = () => {
    onChange("")
    setShowCaption(false)
    onCaptionChange?.("")
    onTypeChange?.("paragraph")
  }

  const handleImageOptions = {
    onReplace: handleImageReplace,
    onAddCaption: handleAddCaption,
    onCrop: handleCropImage,
    onDuplicate: () => onDuplicate?.(id),
    onDelete: handleImageDelete,
  }

  if (type === "image") {
    return (
      <div className="my-4 relative group" tabIndex={0} onKeyDown={onKeyDown} onFocus={onFocus} data-block-id={id}>
        <div
          onMouseEnter={() => setShowImageOptions(true)}
          onMouseLeave={() => setShowImageOptions(false)}
          className="relative"
        >
          <ImageUpload onUpload={onChange} value={content} className="w-full h-[300px]" />
          {showImageOptions && content && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="pointer-events-auto">
                <ImageOptions {...handleImageOptions} />
              </div>
            </div>
          )}
        </div>

        {showCaption && (
          <div
            ref={captionRef}
            contentEditable
            suppressContentEditableWarning
            className="mt-2 px-4 py-2 text-sm text-gray-600 italic outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 border-l-2 border-gray-200"
            onInput={handleCaptionInput}
            onKeyDown={handleCaptionKeyDown}
            data-placeholder="Add a caption..."
            spellCheck="false"
            aria-label="Image caption"
          >
            {caption || ""}
          </div>
        )}

        <CropImageDialog
          open={showCropDialog}
          onClose={() => setShowCropDialog(false)}
          onConfirm={handleCropConfirm}
          imageUrl={content}
        />
      </div>
    )
  }

  if (type === "divider") {
    return (
      <div
        className="my-4 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded p-2"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        data-block-id={id}
      >
        <hr className="border-t border-gray-200" />
      </div>
    )
  }

  if (type === "bullet-list") {
    return (
      <li
        ref={liRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[1.5em] px-4 py-1 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 list-item"
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        data-block-id={id}
        spellCheck="false"
        style={{ listStylePosition: "outside", paddingLeft: "1.5rem" }}
      >
        {content || ""}
      </li>
    )
  }

  if (type === "numbered-list") {
    return (
      <li
        ref={liRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[1.5em] px-4 py-1 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 list-item"
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        data-block-id={id}
        spellCheck="false"
        style={{ listStylePosition: "outside", paddingLeft: "1.5rem" }}
      >
        {content || ""}
      </li>
    )
  }

  const blockStyles = {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-bold mb-3",
    h3: "text-2xl font-bold mb-2",
    quote: "border-l-4 border-gray-300 pl-4 italic",
    paragraph: "",
  }[type]

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "min-h-[1.5em] px-4 py-1 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400",
        blockStyles,
        isActive && "ring-0",
      )}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      data-block-id={id}
      spellCheck="false"
    >
      {content || ""}
    </div>
  )
}