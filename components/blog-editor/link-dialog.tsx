"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LinkDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (url: string, text?: string) => void
  selectedText?: string
}

export function LinkDialog({ open, onClose, onConfirm, selectedText }: LinkDialogProps) {
  const [url, setUrl] = React.useState("")
  const [linkText, setLinkText] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setUrl("")
      setLinkText(selectedText || "")
    }
  }, [open, selectedText])

  const handleConfirm = () => {
    if (url.trim()) {
      onConfirm(url.trim(), linkText.trim() || selectedText)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          {selectedText && (
            <p className="text-sm text-muted-foreground">
              Selected text: "{selectedText.length > 50 ? selectedText.substring(0, 50) + "..." : selectedText}"
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="linkText">Link Text</Label>
            <Input
              id="linkText"
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!url.trim()}>
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
