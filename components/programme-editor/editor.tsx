"use client"

import React, { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "../blog-editor/image-upload"
import { Button } from "@/components/ui/button"
import { nanoid } from "nanoid"
import { Trash2, MoveUp, MoveDown, Plus, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormBuilder } from "./form-builder"
import { Loader2 } from "lucide-react"

type SectionContent =
  | string
  | { url: string; caption?: string }
  | Feature[]
  | { quote: string; author: string; role?: string }
  | { title: string; description: string }

interface SectionData {
  id: string
  type: "header" | "text" | "image" | "features" | "testimonial" | "certification"
  content: SectionContent
}

interface Feature {
  id: string
  title: string
  description: string
}

interface FormField {
  id: string
  type: "text" | "email" | "number" | "select" | "checkbox" | "tel" | "date" | "file" | "textarea" | "radio"
  label: string
  placeholder?: string
  helpText?: string
  options?: string[]
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    customError?: string
  }
}

interface ProgrammeEditorProps {
  initialProgramme?: {
    title?: string
    description?: string
    coverImage?: string
    content?: SectionData[]
    form?: {
      sections: Array<{
        id: string
        title: string
        description?: string
        fields: FormField[]
      }>
      settings?: {
        submitButtonText: string
        successMessage: string
        enableEmailNotifications: boolean
        notificationEmail?: string
      }
    }
  }
  onSave: (programme: any) => Promise<void>
  onChange?: (programme: any) => void
}

export function ProgrammeEditor({ initialProgramme, onSave, onChange }: ProgrammeEditorProps) {
  const [title, setTitleState] = useState(initialProgramme?.title || "")
  const [description, setDescriptionState] = useState(initialProgramme?.description || "")
  const [coverImage, setCoverImageState] = useState(initialProgramme?.coverImage || "")
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSectionsState] = useState<SectionData[]>(initialProgramme?.content || [])
  const [form, setFormState] = useState<{
    sections: Array<{
      id: string
      title: string
      description?: string
      fields: FormField[]
    }>
    settings?: {
      submitButtonText: string
      successMessage: string
      enableEmailNotifications: boolean
      notificationEmail?: string
    }
  }>(
    initialProgramme?.form || {
      sections: [
        {
          id: nanoid(),
          title: "New Section",
          description: "",
          fields: [],
        },
      ],
      settings: {
        submitButtonText: "Submit",
        successMessage: "Form submitted successfully",
        enableEmailNotifications: false,
      },
    },
  )

  const notifyChange = useCallback(() => {
    if (onChange) {
      const updatedProgramme = {
        title,
        description,
        coverImage,
        content: sections,
        form,
      }
      console.log("Notifying Change with Data:", updatedProgramme)
      onChange(updatedProgramme)
    }
  }, [onChange, title, description, coverImage, sections, form])

  function debounce(func: () => void, delay: number) {
    let timer: NodeJS.Timeout
    return () => {
      clearTimeout(timer)
      timer = setTimeout(func, delay)
    }
  }

  const setTitle = (newTitle: string) => {
    setTitleState(newTitle)
    notifyChange()
  }

  const setDescription = (newDescription: string) => {
    setDescriptionState(newDescription)
    notifyChange()
  }

  const setCoverImage = (newImage: string) => {
    setCoverImageState(newImage)
    notifyChange()
  }

  const setSections = React.useCallback(
    (newSections: SectionData[] | ((prev: SectionData[]) => SectionData[])) => {
      setSectionsState(newSections)
      const debounceNotify = debounce(() => notifyChange(), 300)
      debounceNotify()
    },
    [notifyChange, debounce], // Added debounce to dependencies
  )

  const setForm = (newForm: typeof form) => {
    setFormState(newForm)
    notifyChange()
  }

  const addSection = (type: SectionData["type"]) => {
    const newSection: SectionData = {
      id: nanoid(),
      type,
      content:
        type === "features"
          ? []
          : type === "testimonial"
            ? { quote: "", author: "", role: "" }
            : type === "certification"
              ? { title: "", description: "" }
              : "",
    }
    setSections([...sections, newSection])
  }

  const updateSection = (id: string, content: SectionContent) => {
    setSections((prevSections) =>
      prevSections.map((section) => (section.id === id ? { ...section, content } : section)),
    )
    notifyChange()
  }

  const removeSection = (id: string) => {
    const updatedSections = sections.filter((section) => section.id !== id)
    setSections(updatedSections)
    console.log("After Deletion, Updated Sections:", updatedSections)
    notifyChange()
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections]
    const newIndex = direction === "up" ? index - 1 : index + 1
      ;[newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
    setSections(newSections)
  }

  const renderSectionEditor = (section: SectionData, index: number) => {
    switch (section.type) {
      case "header":
        return (
          <Input
            value={typeof section.content === "string" ? section.content : ""}
            onChange={(e) => updateSection(section.id, e.target.value)}
            placeholder="Section Header"
            className="text-xl font-bold"
          />
        )

      case "text":
        return (
          <Textarea
            value={typeof section.content === "string" ? section.content : ""}
            onChange={(e) => updateSection(section.id, e.target.value)}
            placeholder="Enter text content"
            className="min-h-[100px]"
          />
        )

      case "image":
        const imageContent =
          typeof section.content === "object" && "url" in section.content ? section.content : { url: "", caption: "" }
        return (
          <div className="space-y-2">
            <ImageUpload
              onUpload={(url) =>
                updateSection(section.id, {
                  url,
                  caption: imageContent.caption || "",
                })
              }
              value={imageContent.url}
              className="w-full h-[200px]"
            />
            <Input
              placeholder="Image Caption (optional)"
              value={imageContent.caption || ""}
              onChange={(e) =>
                updateSection(section.id, {
                  url: imageContent.url,
                  caption: e.target.value,
                })
              }
            />
          </div>
        )

      case "features":
        return (
          <div className="space-y-4">
            {Array.isArray(section.content) &&
              section.content.map((feature: Feature, i: number) => (
                <div key={feature.id} className="flex gap-2">
                  <Input
                    placeholder="Feature Title"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...(section.content as Feature[])]
                      newFeatures[i] = { ...feature, title: e.target.value }
                      updateSection(section.id, newFeatures)
                    }}
                  />
                  <Input
                    placeholder="Feature Description"
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...(section.content as Feature[])]
                      newFeatures[i] = { ...feature, description: e.target.value }
                      updateSection(section.id, newFeatures)
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      const newFeatures = (section.content as Feature[]).filter((f: Feature) => f.id !== feature.id)
                      updateSection(section.id, newFeatures)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <Button
              onClick={() => {
                const newFeature = { id: nanoid(), title: "", description: "" }
                updateSection(section.id, [...(section.content as Feature[]), newFeature])
              }}
            >
              Add Feature
            </Button>
          </div>
        )

      case "testimonial":
        const testimonialContent =
          typeof section.content === "object" && "quote" in section.content
            ? section.content
            : { quote: "", author: "", role: "" }
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Testimonial Quote"
              value={testimonialContent.quote}
              onChange={(e) =>
                updateSection(section.id, {
                  ...testimonialContent,
                  quote: e.target.value,
                })
              }
            />
            <Input
              placeholder="Author Name"
              value={testimonialContent.author}
              onChange={(e) =>
                updateSection(section.id, {
                  ...testimonialContent,
                  author: e.target.value,
                })
              }
            />
            <Input
              placeholder="Author Role (optional)"
              value={testimonialContent.role || ""}
              onChange={(e) =>
                updateSection(section.id, {
                  ...testimonialContent,
                  role: e.target.value,
                })
              }
            />
          </div>
        )

      case "certification":
        const certificationContent =
          typeof section.content === "object" && "title" in section.content
            ? section.content
            : { title: "", description: "" }
        return (
          <div className="space-y-4">
            <Input
              placeholder="Certification Title"
              value={certificationContent.title}
              onChange={(e) =>
                updateSection(section.id, {
                  ...certificationContent,
                  title: e.target.value,
                })
              }
            />
            <Textarea
              placeholder="Certification Description"
              value={certificationContent.description}
              onChange={(e) =>
                updateSection(section.id, {
                  ...certificationContent,
                  description: e.target.value,
                })
              }
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Programme Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Programme Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Programme Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <ImageUpload
            onUpload={setCoverImage}
            value={coverImage}
            className="w-full h-[300px]"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Select
                value={section.type}
                onValueChange={(value: SectionData['type']) => {
                  const newSection = {
                    ...section,
                    type: value,
                    content: value === 'features' ? [] :
                      value === 'testimonial' ? { quote: '', author: '', role: '' } :
                        value === 'certification' ? { title: '', description: '' } :
                          ''
                  };
                  setSections(sections.map(s => s.id === section.id ? newSection : s));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Section Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveSection(index, 'up')}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                )}
                {index < sections.length - 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveSection(index, 'down')}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderSectionEditor(section, index)}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => addSection('header')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Header
            </Button>
            <Button variant="outline" onClick={() => addSection('text')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <Button variant="outline" onClick={() => addSection('image')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            <Button variant="outline" onClick={() => addSection('features')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Features
            </Button>
            <Button variant="outline" onClick={() => addSection('testimonial')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
            <Button variant="outline" onClick={() => addSection('certification')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder Section */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
        <FormBuilder
          form={form}
          onChange={(newForm) => {
            setForm(newForm)
          }}
        />
        </CardContent>
      </Card>
      <Button
        onClick={() => onSave({ title, description, coverImage, content: sections, form })}
        className="w-full bg-primary text-white hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Programme
      </Button>
    </div>
  )
}

export default ProgrammeEditor

