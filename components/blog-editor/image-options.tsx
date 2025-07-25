"use client"
import { MoreHorizontal, RefreshCw, Type, Crop, Copy, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ImageOptionsProps {
  onReplace: () => void
  onAddCaption: () => void
  onCrop: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function ImageOptions({ onReplace, onAddCaption, onCrop, onDuplicate, onDelete }: ImageOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReplace}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Replace Image
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={onAddCaption}>
          <Type className="mr-2 h-4 w-4" />
          Add Caption
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={onCrop}>
          <Crop className="mr-2 h-4 w-4" />
          Crop Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
