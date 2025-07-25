"use client"
import { Bold, Italic, Underline, Strikethrough, Code, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as React from "react"

interface TextFormattingDialogProps {
  open: boolean
  onFormat: (format: string) => void
  onClose: () => void
  selectedText: string
}

export function TextFormattingDialog({ open, onFormat, onClose, selectedText }: TextFormattingDialogProps) {
  const formatButtons = [
    { icon: Bold, format: "bold", label: "Bold" },
    { icon: Italic, format: "italic", label: "Italic" },
    { icon: Underline, format: "underline", label: "Underline" },
    { icon: Strikethrough, format: "strikethrough", label: "Strikethrough" },
    { icon: Code, format: "code", label: "Code" },
    { icon: Link, format: "link", label: "Link" },
  ]

  const handleFormat = (format: string) => {
    onFormat(format)
    // Only close if it's not a link format (link dialog will handle its own closing)
    if (format !== "link") {
      onClose()
    }
  }

  // Handle escape key to close dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Format Text</DialogTitle>
          {selectedText && (
            <p className="text-sm text-muted-foreground">
              Selected: "{selectedText.length > 50 ? selectedText.substring(0, 50) + "..." : selectedText}"
              <span className="ml-2 text-xs">(Select one continuous text range to format)</span>
            </p>
          )}
        </DialogHeader>
        <div className="flex flex-wrap gap-2 p-4">
          {formatButtons.map(({ icon: Icon, format, label }) => (
            <Button
              key={format}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-50 bg-transparent transition-colors"
              onClick={() => handleFormat(format)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}