"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Heading1, Heading2, Heading3, Text, Quote, List, ListOrdered, ImageIcon, Minus } from "lucide-react"

interface BlockMenuDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (type: string) => void
}

const blocks = [
  {
    group: "Headings",
    items: [
      { name: "Heading 1", type: "h1", icon: Heading1, shortcut: "Ctrl+Alt+1", description: "Top-level heading" },
      { name: "Heading 2", type: "h2", icon: Heading2, shortcut: "Ctrl+Alt+2", description: "Key section heading" },
      { name: "Heading 3", type: "h3", icon: Heading3, shortcut: "Ctrl+Alt+3", description: "Subsection heading" },
    ],
  },
  {
    group: "Basic",
    items: [
      { name: "Paragraph", type: "paragraph", icon: Text, shortcut: "Ctrl+Alt+0", description: "Basic text block" },
      { name: "Quote", type: "quote", icon: Quote, shortcut: "Ctrl+Alt+Q", description: "Capture a quote" },
      { name: "Divider", type: "divider", icon: Minus, description: "Visual separator" },
    ],
  },
  {
    group: "Lists",
    items: [
      {
        name: "Bullet List",
        type: "bullet-list",
        icon: List,
        shortcut: "Ctrl+Alt+8",
        description: "Create a bullet list",
      },
      {
        name: "Numbered List",
        type: "numbered-list",
        icon: ListOrdered,
        shortcut: "Ctrl+Alt+9",
        description: "Create a numbered list",
      },
    ],
  },
  {
    group: "Media",
    items: [{ name: "Image", type: "image", icon: ImageIcon, description: "Upload an image" }],
  },
]

export function BlockMenuDialog({ open, onClose, onSelect }: BlockMenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Block</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Type a command or search..." autoFocus />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {blocks.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.type}
                    onSelect={() => {
                      onSelect(item.type)
                      onClose()
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.shortcut && <span className="text-xs text-muted-foreground">{item.shortcut}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
